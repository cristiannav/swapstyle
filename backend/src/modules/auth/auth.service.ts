import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import * as argon2 from 'argon2';
import { createHash, randomBytes, randomUUID } from 'crypto';
import type Redis from 'ioredis';
import { User, AuthProvider } from '../users/entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import {
  VerificationToken,
  VerificationPurpose,
} from './entities/email-verification.entity';
import { MailService } from '../mail/mail.service';
import { REDIS_CLIENT } from '../redis/redis.module';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import type { JwtConfig } from '../../config/configuration';
import type { JwtPayload, RefreshPayload } from './types/jwt-payload';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface AuthResult extends AuthTokens {
  user: User;
}

const REVOKED_PREFIX = 'auth:revoked:';
const REFRESH_TTL_SECONDS = 60 * 60 * 24 * 7;

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(RefreshToken) private readonly refreshTokens: Repository<RefreshToken>,
    @InjectRepository(VerificationToken)
    private readonly verifications: Repository<VerificationToken>,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly dataSource: DataSource,
    private readonly mail: MailService,
  ) {}

  async register(dto: RegisterDto, meta: { ip?: string; userAgent?: string }): Promise<AuthResult> {
    const existing = await this.users.findOne({
      where: [{ email: dto.email }, { username: dto.username }],
    });
    if (existing) {
      throw new ConflictException(
        existing.email === dto.email
          ? 'El email ya está registrado'
          : 'El nombre de usuario ya está en uso',
      );
    }

    const passwordHash = await argon2.hash(dto.password, { type: argon2.argon2id });
    const user = await this.dataSource.transaction(async (em) => {
      const u = em.create(User, {
        email: dto.email,
        passwordHash,
        name: dto.name,
        username: dto.username,
        birthdate: dto.birthdate ? new Date(dto.birthdate) : null,
        authProvider: AuthProvider.LOCAL,
      });
      const saved = await em.save(u);

      const { token, hash } = this.makeToken();
      await em.save(
        em.create(VerificationToken, {
          userId: saved.id,
          tokenHash: hash,
          purpose: VerificationPurpose.EMAIL_VERIFICATION,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        }),
      );

      void this.mail.sendVerificationEmail(saved.email, token);

      return saved;
    });

    const tokens = await this.issueTokens(user, meta);
    return { ...tokens, user };
  }

  async login(dto: LoginDto, meta: { ip?: string; userAgent?: string }): Promise<AuthResult> {
    const user = await this.users.findOne({ where: { email: dto.email } });
    const stored = user?.passwordHash;

    // Constant-time-ish: si no existe el user, igual hacemos un verify
    const dummy = '$argon2id$v=19$m=65536,t=3,p=4$YWFhYWFhYWFhYWFhYWFhYQ$abc';
    const valid = stored
      ? await argon2.verify(stored, dto.password).catch(() => false)
      : (await argon2.verify(dummy, dto.password).catch(() => false), false);

    if (!user || !stored || !valid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    user.lastLoginAt = new Date();
    await this.users.save(user);

    const tokens = await this.issueTokens(user, meta);
    return { ...tokens, user };
  }

  async refresh(refreshToken: string, meta: { ip?: string; userAgent?: string }): Promise<AuthTokens> {
    let payload: RefreshPayload;
    try {
      payload = this.jwt.verify<RefreshPayload>(refreshToken, {
        secret: this.config.getOrThrow<JwtConfig>('jwt').refreshSecret,
      });
    } catch {
      throw new UnauthorizedException('Refresh token inválido');
    }

    const blacklisted = await this.redis.exists(`${REVOKED_PREFIX}${payload.jti}`);
    if (blacklisted) throw new UnauthorizedException('Refresh token revocado');

    const tokenHash = this.sha256(refreshToken);
    const stored = await this.refreshTokens.findOne({
      where: { tokenHash, userId: payload.sub, revoked: false },
    });
    if (!stored || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }

    const user = await this.users.findOneOrFail({ where: { id: payload.sub } });

    // Rotación: revocar viejo, emitir nuevo
    await this.refreshTokens.update({ id: stored.id }, { revoked: true });
    await this.redis.set(
      `${REVOKED_PREFIX}${payload.jti}`,
      '1',
      'EX',
      REFRESH_TTL_SECONDS,
    );

    return this.issueTokens(user, meta);
  }

  async logout(userId: string, refreshToken?: string): Promise<void> {
    if (refreshToken) {
      try {
        const payload = this.jwt.verify<RefreshPayload>(refreshToken, {
          secret: this.config.getOrThrow<JwtConfig>('jwt').refreshSecret,
        });
        await this.redis.set(
          `${REVOKED_PREFIX}${payload.jti}`,
          '1',
          'EX',
          REFRESH_TTL_SECONDS,
        );
      } catch {
        // token inválido — ignoramos
      }
    }
    await this.refreshTokens.update({ userId, revoked: false }, { revoked: true });
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.users.findOne({ where: { email } });
    if (!user) return; // silencioso

    const { token, hash } = this.makeToken();
    await this.verifications.save(
      this.verifications.create({
        userId: user.id,
        tokenHash: hash,
        purpose: VerificationPurpose.PASSWORD_RESET,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      }),
    );

    void this.mail.sendPasswordResetEmail(user.email, token);
  }

  async resetPassword(token: string, password: string): Promise<void> {
    const hash = this.sha256(token);
    const verification = await this.verifications.findOne({
      where: {
        tokenHash: hash,
        purpose: VerificationPurpose.PASSWORD_RESET,
      },
    });
    if (!verification || verification.usedAt || verification.expiresAt < new Date()) {
      throw new BadRequestException('Token inválido o expirado');
    }

    const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
    await this.dataSource.transaction(async (em) => {
      await em.update(User, { id: verification.userId }, { passwordHash });
      await em.update(VerificationToken, { id: verification.id }, { usedAt: new Date() });
      await em.update(RefreshToken, { userId: verification.userId, revoked: false }, { revoked: true });
    });
  }

  async verifyEmail(token: string): Promise<void> {
    const hash = this.sha256(token);
    const verification = await this.verifications.findOne({
      where: {
        tokenHash: hash,
        purpose: VerificationPurpose.EMAIL_VERIFICATION,
      },
    });
    if (!verification || verification.usedAt || verification.expiresAt < new Date()) {
      throw new BadRequestException('Token inválido o expirado');
    }

    await this.dataSource.transaction(async (em) => {
      await em.update(User, { id: verification.userId }, { emailVerified: true });
      await em.update(VerificationToken, { id: verification.id }, { usedAt: new Date() });
    });
  }

  // ===== helpers =====

  private async issueTokens(
    user: User,
    meta: { ip?: string; userAgent?: string },
  ): Promise<AuthTokens> {
    const jwtCfg = this.config.getOrThrow<JwtConfig>('jwt');
    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role };

    const accessToken = await this.jwt.signAsync(payload, {
      secret: jwtCfg.accessSecret,
      expiresIn: jwtCfg.accessTtl,
    });

    const jti = randomUUID();
    const refreshToken = await this.jwt.signAsync(
      { sub: user.id, jti } satisfies RefreshPayload,
      { secret: jwtCfg.refreshSecret, expiresIn: jwtCfg.refreshTtl },
    );

    await this.refreshTokens.save(
      this.refreshTokens.create({
        userId: user.id,
        tokenHash: this.sha256(refreshToken),
        expiresAt: new Date(Date.now() + REFRESH_TTL_SECONDS * 1000),
        userAgent: meta.userAgent ?? null,
        ipAddress: meta.ip ?? null,
      }),
    );

    return { accessToken, refreshToken };
  }

  private makeToken(): { token: string; hash: string } {
    const token = randomBytes(32).toString('base64url');
    return { token, hash: this.sha256(token) };
  }

  private sha256(input: string): string {
    return createHash('sha256').update(input).digest('hex');
  }
}

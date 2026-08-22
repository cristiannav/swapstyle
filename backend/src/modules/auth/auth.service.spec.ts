import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import * as argon2 from 'argon2';
import { AuthService } from './auth.service';
import { User, AuthProvider, UserRole } from '../users/entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { VerificationToken } from './entities/email-verification.entity';
import { MailService } from '../mail/mail.service';
import { REDIS_CLIENT } from '../redis/redis.module';

describe('AuthService', () => {
  let service: AuthService;
  let users: { findOne: jest.Mock; save: jest.Mock };
  let refreshTokens: { save: jest.Mock; create: jest.Mock };
  let verifications: { save: jest.Mock; create: jest.Mock };
  let mail: { sendVerificationEmail: jest.Mock };
  let redis: { exists: jest.Mock; set: jest.Mock };
  let jwt: { signAsync: jest.Mock; verify: jest.Mock };
  let dataSource: { transaction: jest.Mock };

  beforeEach(async () => {
    users = { findOne: jest.fn(), save: jest.fn() };
    refreshTokens = { save: jest.fn(), create: jest.fn((x) => x) };
    verifications = { save: jest.fn(), create: jest.fn((x) => x) };
    mail = { sendVerificationEmail: jest.fn() };
    redis = { exists: jest.fn(), set: jest.fn() };
    jwt = {
      signAsync: jest.fn(async () => 'signed-token'),
      verify: jest.fn(),
    };
    dataSource = {
      transaction: jest.fn(async (cb) => {
        const em = {
          create: jest.fn((_e, payload) => payload),
          save: jest.fn(async (x) => ({ id: 'user-id', ...(Array.isArray(x) ? x[0] : x) })),
        };
        return cb(em);
      }),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: users },
        { provide: getRepositoryToken(RefreshToken), useValue: refreshTokens },
        { provide: getRepositoryToken(VerificationToken), useValue: verifications },
        { provide: MailService, useValue: mail },
        { provide: REDIS_CLIENT, useValue: redis },
        { provide: JwtService, useValue: jwt },
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: (key: string) => {
              if (key === 'jwt')
                return {
                  accessSecret: 'a'.repeat(32),
                  refreshSecret: 'b'.repeat(32),
                  accessTtl: '15m',
                  refreshTtl: '7d',
                };
              return undefined;
            },
          },
        },
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    service = moduleRef.get(AuthService);
  });

  describe('register', () => {
    it('rechaza email duplicado con ConflictException', async () => {
      users.findOne.mockResolvedValueOnce({ email: 'a@b.com', username: 'foo' });
      await expect(
        service.register(
          { email: 'a@b.com', password: 'password123', name: 'A', username: 'bar' },
          {},
        ),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('crea usuario y emite tokens cuando el email es nuevo', async () => {
      users.findOne.mockResolvedValueOnce(null);
      const result = await service.register(
        { email: 'new@swapstyle.app', password: 'password123', name: 'New', username: 'newuser' },
        { ip: '127.0.0.1', userAgent: 'test' },
      );
      expect(result.accessToken).toBe('signed-token');
      expect(result.refreshToken).toBe('signed-token');
      expect(refreshTokens.save).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('lanza UnauthorizedException con credenciales inválidas', async () => {
      users.findOne.mockResolvedValueOnce(null);
      await expect(
        service.login({ email: 'a@b.com', password: 'wrongpass' }, {}),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('emite tokens cuando la password coincide', async () => {
      const passwordHash = await argon2.hash('password123', { type: argon2.argon2id });
      users.findOne.mockResolvedValueOnce({
        id: 'u1',
        email: 'a@b.com',
        passwordHash,
        role: UserRole.USER,
        authProvider: AuthProvider.LOCAL,
      });
      users.save.mockResolvedValueOnce({});
      const result = await service.login(
        { email: 'a@b.com', password: 'password123' },
        { ip: '127.0.0.1' },
      );
      expect(result.accessToken).toBe('signed-token');
    });
  });
});

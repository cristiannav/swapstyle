"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const argon2 = __importStar(require("argon2"));
const crypto_1 = require("crypto");
const user_entity_1 = require("../users/entities/user.entity");
const refresh_token_entity_1 = require("./entities/refresh-token.entity");
const email_verification_entity_1 = require("./entities/email-verification.entity");
const mail_service_1 = require("../mail/mail.service");
const redis_module_1 = require("../redis/redis.module");
const login_throttle_service_1 = require("../security/login-throttle.service");
const REVOKED_PREFIX = 'auth:revoked:';
const REFRESH_TTL_SECONDS = 60 * 60 * 24 * 7;
let AuthService = class AuthService {
    users;
    refreshTokens;
    verifications;
    redis;
    jwt;
    config;
    dataSource;
    mail;
    loginThrottle;
    constructor(users, refreshTokens, verifications, redis, jwt, config, dataSource, mail, loginThrottle) {
        this.users = users;
        this.refreshTokens = refreshTokens;
        this.verifications = verifications;
        this.redis = redis;
        this.jwt = jwt;
        this.config = config;
        this.dataSource = dataSource;
        this.mail = mail;
        this.loginThrottle = loginThrottle;
    }
    async register(dto, meta) {
        const existing = await this.users.findOne({
            where: [{ email: dto.email }, { username: dto.username }],
        });
        if (existing) {
            throw new common_1.ConflictException(existing.email === dto.email
                ? 'El email ya está registrado'
                : 'El nombre de usuario ya está en uso');
        }
        const passwordHash = await argon2.hash(dto.password, { type: argon2.argon2id });
        const user = await this.dataSource.transaction(async (em) => {
            const u = em.create(user_entity_1.User, {
                email: dto.email,
                passwordHash,
                name: dto.name,
                username: dto.username,
                birthdate: dto.birthdate ? new Date(dto.birthdate) : null,
                authProvider: user_entity_1.AuthProvider.LOCAL,
            });
            const saved = await em.save(u);
            const { token, hash } = this.makeToken();
            await em.save(em.create(email_verification_entity_1.VerificationToken, {
                userId: saved.id,
                tokenHash: hash,
                purpose: email_verification_entity_1.VerificationPurpose.EMAIL_VERIFICATION,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            }));
            void this.mail.sendVerificationEmail(saved.email, token);
            return saved;
        });
        const tokens = await this.issueTokens(user, meta);
        return { ...tokens, user };
    }
    async login(dto, meta) {
        await this.loginThrottle.assertNotLocked(dto.email, meta.ip);
        const user = await this.users.findOne({ where: { email: dto.email } });
        const stored = user?.passwordHash;
        const dummy = '$argon2id$v=19$m=65536,t=3,p=4$YWFhYWFhYWFhYWFhYWFhYQ$abc';
        const valid = stored
            ? await argon2.verify(stored, dto.password).catch(() => false)
            : (await argon2.verify(dummy, dto.password).catch(() => false), false);
        if (!user || !stored || !valid) {
            await this.loginThrottle.registerFailure(dto.email, meta.ip);
            throw new common_1.UnauthorizedException('Credenciales inválidas');
        }
        await this.loginThrottle.registerSuccess(dto.email);
        user.lastLoginAt = new Date();
        await this.users.save(user);
        const tokens = await this.issueTokens(user, meta);
        return { ...tokens, user };
    }
    async refresh(refreshToken, meta) {
        let payload;
        try {
            payload = this.jwt.verify(refreshToken, {
                secret: this.config.getOrThrow('jwt').refreshSecret,
            });
        }
        catch {
            throw new common_1.UnauthorizedException('Refresh token inválido');
        }
        const blacklisted = await this.redis.exists(`${REVOKED_PREFIX}${payload.jti}`);
        if (blacklisted)
            throw new common_1.UnauthorizedException('Refresh token revocado');
        const tokenHash = this.sha256(refreshToken);
        const stored = await this.refreshTokens.findOne({
            where: { tokenHash, userId: payload.sub, revoked: false },
        });
        if (!stored || stored.expiresAt < new Date()) {
            throw new common_1.UnauthorizedException('Refresh token inválido o expirado');
        }
        const user = await this.users.findOneOrFail({ where: { id: payload.sub } });
        await this.refreshTokens.update({ id: stored.id }, { revoked: true });
        await this.redis.set(`${REVOKED_PREFIX}${payload.jti}`, '1', 'EX', REFRESH_TTL_SECONDS);
        return this.issueTokens(user, meta);
    }
    async logout(userId, refreshToken) {
        if (refreshToken) {
            try {
                const payload = this.jwt.verify(refreshToken, {
                    secret: this.config.getOrThrow('jwt').refreshSecret,
                });
                await this.redis.set(`${REVOKED_PREFIX}${payload.jti}`, '1', 'EX', REFRESH_TTL_SECONDS);
            }
            catch {
            }
        }
        await this.refreshTokens.update({ userId, revoked: false }, { revoked: true });
    }
    async forgotPassword(email) {
        const user = await this.users.findOne({ where: { email } });
        if (!user)
            return;
        const { token, hash } = this.makeToken();
        await this.verifications.save(this.verifications.create({
            userId: user.id,
            tokenHash: hash,
            purpose: email_verification_entity_1.VerificationPurpose.PASSWORD_RESET,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        }));
        void this.mail.sendPasswordResetEmail(user.email, token);
    }
    async resetPassword(token, password) {
        const hash = this.sha256(token);
        const verification = await this.verifications.findOne({
            where: {
                tokenHash: hash,
                purpose: email_verification_entity_1.VerificationPurpose.PASSWORD_RESET,
            },
        });
        if (!verification || verification.usedAt || verification.expiresAt < new Date()) {
            throw new common_1.BadRequestException('Token inválido o expirado');
        }
        const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
        await this.dataSource.transaction(async (em) => {
            await em.update(user_entity_1.User, { id: verification.userId }, { passwordHash });
            await em.update(email_verification_entity_1.VerificationToken, { id: verification.id }, { usedAt: new Date() });
            await em.update(refresh_token_entity_1.RefreshToken, { userId: verification.userId, revoked: false }, { revoked: true });
        });
    }
    async verifyEmail(token) {
        const hash = this.sha256(token);
        const verification = await this.verifications.findOne({
            where: {
                tokenHash: hash,
                purpose: email_verification_entity_1.VerificationPurpose.EMAIL_VERIFICATION,
            },
        });
        if (!verification || verification.usedAt || verification.expiresAt < new Date()) {
            throw new common_1.BadRequestException('Token inválido o expirado');
        }
        await this.dataSource.transaction(async (em) => {
            await em.update(user_entity_1.User, { id: verification.userId }, { emailVerified: true });
            await em.update(email_verification_entity_1.VerificationToken, { id: verification.id }, { usedAt: new Date() });
        });
    }
    async issueTokens(user, meta) {
        const jwtCfg = this.config.getOrThrow('jwt');
        const payload = { sub: user.id, email: user.email, role: user.role };
        const accessToken = await this.jwt.signAsync(payload, {
            secret: jwtCfg.accessSecret,
            expiresIn: jwtCfg.accessTtl,
        });
        const jti = (0, crypto_1.randomUUID)();
        const refreshToken = await this.jwt.signAsync({ sub: user.id, jti }, { secret: jwtCfg.refreshSecret, expiresIn: jwtCfg.refreshTtl });
        await this.refreshTokens.save(this.refreshTokens.create({
            userId: user.id,
            tokenHash: this.sha256(refreshToken),
            expiresAt: new Date(Date.now() + REFRESH_TTL_SECONDS * 1000),
            userAgent: meta.userAgent ?? null,
            ipAddress: meta.ip ?? null,
        }));
        return { accessToken, refreshToken };
    }
    makeToken() {
        const token = (0, crypto_1.randomBytes)(32).toString('base64url');
        return { token, hash: this.sha256(token) };
    }
    sha256(input) {
        return (0, crypto_1.createHash)('sha256').update(input).digest('hex');
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(refresh_token_entity_1.RefreshToken)),
    __param(2, (0, typeorm_1.InjectRepository)(email_verification_entity_1.VerificationToken)),
    __param(3, (0, common_1.Inject)(redis_module_1.REDIS_CLIENT)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository, Function, jwt_1.JwtService,
        config_1.ConfigService,
        typeorm_2.DataSource,
        mail_service_1.MailService,
        login_throttle_service_1.LoginThrottleService])
], AuthService);
//# sourceMappingURL=auth.service.js.map
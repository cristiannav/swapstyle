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
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const argon2 = __importStar(require("argon2"));
const auth_service_1 = require("./auth.service");
const user_entity_1 = require("../users/entities/user.entity");
const refresh_token_entity_1 = require("./entities/refresh-token.entity");
const email_verification_entity_1 = require("./entities/email-verification.entity");
const mail_service_1 = require("../mail/mail.service");
const redis_module_1 = require("../redis/redis.module");
const login_throttle_service_1 = require("../security/login-throttle.service");
describe('AuthService', () => {
    let service;
    let users;
    let refreshTokens;
    let verifications;
    let mail;
    let redis;
    let jwt;
    let dataSource;
    let loginThrottle;
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
        loginThrottle = {
            assertNotLocked: jest.fn(),
            registerFailure: jest.fn(),
            registerSuccess: jest.fn(),
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
        const moduleRef = await testing_1.Test.createTestingModule({
            providers: [
                auth_service_1.AuthService,
                { provide: (0, typeorm_1.getRepositoryToken)(user_entity_1.User), useValue: users },
                { provide: (0, typeorm_1.getRepositoryToken)(refresh_token_entity_1.RefreshToken), useValue: refreshTokens },
                { provide: (0, typeorm_1.getRepositoryToken)(email_verification_entity_1.VerificationToken), useValue: verifications },
                { provide: mail_service_1.MailService, useValue: mail },
                { provide: redis_module_1.REDIS_CLIENT, useValue: redis },
                { provide: jwt_1.JwtService, useValue: jwt },
                {
                    provide: config_1.ConfigService,
                    useValue: {
                        getOrThrow: (key) => {
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
                { provide: typeorm_2.DataSource, useValue: dataSource },
                { provide: login_throttle_service_1.LoginThrottleService, useValue: loginThrottle },
            ],
        }).compile();
        service = moduleRef.get(auth_service_1.AuthService);
    });
    describe('register', () => {
        it('rechaza email duplicado con ConflictException', async () => {
            users.findOne.mockResolvedValueOnce({ email: 'a@b.com', username: 'foo' });
            await expect(service.register({ email: 'a@b.com', password: 'password123', name: 'A', username: 'bar' }, {})).rejects.toBeInstanceOf(common_1.ConflictException);
        });
        it('crea usuario y emite tokens cuando el email es nuevo', async () => {
            users.findOne.mockResolvedValueOnce(null);
            const result = await service.register({ email: 'new@swapstyle.app', password: 'password123', name: 'New', username: 'newuser' }, { ip: '127.0.0.1', userAgent: 'test' });
            expect(result.accessToken).toBe('signed-token');
            expect(result.refreshToken).toBe('signed-token');
            expect(refreshTokens.save).toHaveBeenCalled();
        });
    });
    describe('login', () => {
        it('lanza UnauthorizedException con credenciales inválidas', async () => {
            users.findOne.mockResolvedValueOnce(null);
            await expect(service.login({ email: 'a@b.com', password: 'wrongpass' }, {})).rejects.toBeInstanceOf(common_1.UnauthorizedException);
        });
        it('emite tokens cuando la password coincide', async () => {
            const passwordHash = await argon2.hash('password123', { type: argon2.argon2id });
            users.findOne.mockResolvedValueOnce({
                id: 'u1',
                email: 'a@b.com',
                passwordHash,
                role: user_entity_1.UserRole.USER,
                authProvider: user_entity_1.AuthProvider.LOCAL,
            });
            users.save.mockResolvedValueOnce({});
            const result = await service.login({ email: 'a@b.com', password: 'password123' }, { ip: '127.0.0.1' });
            expect(result.accessToken).toBe('signed-token');
        });
    });
});
//# sourceMappingURL=auth.service.spec.js.map
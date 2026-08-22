import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { DataSource, Repository } from 'typeorm';
import type Redis from 'ioredis';
import { User } from '../users/entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { VerificationToken } from './entities/email-verification.entity';
import { MailService } from '../mail/mail.service';
import { LoginThrottleService } from '../security/login-throttle.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}
interface AuthResult extends AuthTokens {
    user: User;
}
export declare class AuthService {
    private readonly users;
    private readonly refreshTokens;
    private readonly verifications;
    private readonly redis;
    private readonly jwt;
    private readonly config;
    private readonly dataSource;
    private readonly mail;
    private readonly loginThrottle;
    constructor(users: Repository<User>, refreshTokens: Repository<RefreshToken>, verifications: Repository<VerificationToken>, redis: Redis, jwt: JwtService, config: ConfigService, dataSource: DataSource, mail: MailService, loginThrottle: LoginThrottleService);
    register(dto: RegisterDto, meta: {
        ip?: string;
        userAgent?: string;
    }): Promise<AuthResult>;
    login(dto: LoginDto, meta: {
        ip?: string;
        userAgent?: string;
    }): Promise<AuthResult>;
    refresh(refreshToken: string, meta: {
        ip?: string;
        userAgent?: string;
    }): Promise<AuthTokens>;
    logout(userId: string, refreshToken?: string): Promise<void>;
    forgotPassword(email: string): Promise<void>;
    resetPassword(token: string, password: string): Promise<void>;
    verifyEmail(token: string): Promise<void>;
    private issueTokens;
    private makeToken;
    private sha256;
}
export {};

import type { Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import type { JwtPayload } from './types/jwt-payload';
export declare class AuthController {
    private readonly auth;
    constructor(auth: AuthService);
    register(dto: RegisterDto, ip: string, req: Request): Promise<{
        user: import("../users/dto/me.dto").MeDto;
        accessToken: string;
        refreshToken: string;
    }>;
    login(dto: LoginDto, ip: string, req: Request): Promise<{
        user: import("../users/dto/me.dto").MeDto;
        accessToken: string;
        refreshToken: string;
    }>;
    refresh(dto: RefreshDto, ip: string, req: Request): Promise<import("./auth.service").AuthTokens>;
    logout(user: JwtPayload, dto?: RefreshDto): Promise<void>;
    forgotPassword(dto: ForgotPasswordDto): Promise<{
        message: string;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<void>;
    verifyEmail(dto: VerifyEmailDto): Promise<void>;
}

import { BaseEntity } from '../../../database/base.entity';
export declare enum UserRole {
    USER = "user",
    ADMIN = "admin"
}
export declare enum AuthProvider {
    LOCAL = "local",
    GOOGLE = "google",
    FACEBOOK = "facebook"
}
export declare class User extends BaseEntity {
    email: string;
    passwordHash: string | null;
    name: string;
    username: string;
    birthdate: Date | null;
    gender: string | null;
    bio: string | null;
    avatarUrl: string | null;
    city: string | null;
    country: string | null;
    emailVerified: boolean;
    role: UserRole;
    authProvider: AuthProvider;
    providerId: string | null;
    isPremium: boolean;
    superLikesRemaining: number;
    lastLoginAt: Date | null;
}

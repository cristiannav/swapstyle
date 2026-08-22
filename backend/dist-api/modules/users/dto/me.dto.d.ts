import { User, UserRole } from '../entities/user.entity';
export interface MeDto {
    id: string;
    email: string;
    name: string;
    username: string;
    birthdate: string | null;
    gender: string | null;
    bio: string | null;
    avatarUrl: string | null;
    city: string | null;
    country: string | null;
    emailVerified: boolean;
    role: UserRole;
    isPremium: boolean;
    superLikesRemaining: number;
}
export interface PublicUserDto {
    id: string;
    username: string;
    name: string;
    avatarUrl: string | null;
    city: string | null;
    isPremium: boolean;
}
export declare function toMeDto(user: User): MeDto;
export declare function toPublicUserDto(user: User): PublicUserDto;

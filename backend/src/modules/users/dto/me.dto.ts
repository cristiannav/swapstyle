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

export function toMeDto(user: User): MeDto {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    username: user.username,
    //birthdate: user.birthdate ? user.birthdate.toISOString().slice(0, 10) : null,
    birthdate: user.birthdate
      ? new Date(user.birthdate).toISOString().slice(0, 10)
      : null,
    gender: user.gender,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    city: user.city,
    country: user.country,
    emailVerified: user.emailVerified,
    role: user.role,
    isPremium: user.isPremium,
    superLikesRemaining: user.superLikesRemaining,
  };
}

export function toPublicUserDto(user: User): PublicUserDto {
  return {
    id: user.id,
    username: user.username,
    name: user.name,
    avatarUrl: user.avatarUrl,
    city: user.city,
    isPremium: user.isPremium,
  };
}

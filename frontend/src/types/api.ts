export type UUID = string;
export type ISODateString = string;

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface PublicUser {
  id: UUID;
  username: string;
  name: string;
  avatarUrl: string | null;
  city: string | null;
  isPremium: boolean;
}

export interface Me extends PublicUser {
  email: string;
  bio: string | null;
  birthdate: ISODateString | null;
  gender: string | null;
  country: string | null;
  emailVerified: boolean;
  superLikesRemaining: number;
}

export type GarmentCategory =
  | 'top' | 'bottom' | 'dress' | 'outerwear'
  | 'shoes' | 'accessory' | 'bag' | 'other';

export type GarmentCondition = 'new' | 'like_new' | 'good' | 'fair';
export type GarmentStatus = 'available' | 'reserved' | 'swapped' | 'hidden';

export interface Garment {
  id: UUID;
  ownerId: UUID;
  owner?: PublicUser;
  title: string;
  description: string | null;
  category: GarmentCategory;
  brand: string | null;
  size: string | null;
  color: string | null;
  condition: GarmentCondition;
  status: GarmentStatus;
  isPremium: boolean;
  images: { id: UUID; url: string; position: number }[];
  createdAt: ISODateString;
}

export type SwipeAction = 'like' | 'pass' | 'super_like';

export interface SwipeResult {
  matched: boolean;
  match?: Match;
}

export interface Match {
  id: UUID;
  status: 'active' | 'archived' | 'completed' | 'canceled';
  userA: PublicUser;
  userB: PublicUser;
  garmentA: Garment;
  garmentB: Garment;
  lastMessageAt: ISODateString | null;
  createdAt: ISODateString;
}

export interface Message {
  id: UUID;
  matchId: UUID;
  senderId: UUID;
  type: 'text' | 'system' | 'image';
  content: string;
  readAt: ISODateString | null;
  createdAt: ISODateString;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse extends AuthTokens {
  user: Me;
}

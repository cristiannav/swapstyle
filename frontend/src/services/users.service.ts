import { api } from '@/lib/http-client';
import type { Me, PublicUser } from '@/types/api';

export interface UpdateProfilePayload {
  name?: string;
  bio?: string;
  avatarUrl?: string;
  city?: string;
  country?: string;
  birthdate?: string;
  gender?: string;
}

export const usersService = {
  me: () => api.get<Me>('/users/me'),
  updateMe: (payload: UpdateProfilePayload) => api.patch<Me>('/users/me', payload),
  deleteMe: () => api.delete<void>('/users/me'),
  byUsername: (username: string) => api.get<PublicUser>(`/users/${username}`),
};

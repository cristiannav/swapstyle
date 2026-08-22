import { api } from '@/lib/http-client';
import type { AuthResponse, AuthTokens, Me } from '@/types/api';

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
  username: string;
  birthdate?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const authService = {
  register: (payload: RegisterPayload) =>
    api.post<AuthResponse>('/auth/register', payload),
  login: (payload: LoginPayload) =>
    api.post<AuthResponse>('/auth/login', payload),
  refresh: (refreshToken: string) =>
    api.post<AuthTokens>('/auth/refresh', { refreshToken }),
  logout: () => api.post<void>('/auth/logout'),
  me: () => api.get<Me>('/users/me'),
  forgotPassword: (email: string) =>
    api.post<void>('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) =>
    api.post<void>('/auth/reset-password', { token, password }),
  verifyEmail: (token: string) =>
    api.post<void>('/auth/verify-email', { token }),
};

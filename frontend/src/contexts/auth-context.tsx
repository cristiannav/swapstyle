import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useNavigate } from 'react-router';
import { authService, type LoginPayload, type RegisterPayload } from '@/services/auth.service';
import { setOnUnauthorized } from '@/lib/http-client';
import { tokenStorage } from '@/lib/storage';
import { ApiError } from '@/lib/api-error';
import type { Me } from '@/types/api';

type Status = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthContextValue {
  user: Me | null;
  status: Status;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<Me | null>(null);
  const [status, setStatus] = useState<Status>('loading');

  const refreshUser = useCallback(async () => {
    try {
      const me = await authService.me();
      setUser(me);
      setStatus('authenticated');
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        tokenStorage.clear();
      }
      setUser(null);
      setStatus('unauthenticated');
    }
  }, []);

  useEffect(() => {
    setOnUnauthorized(() => {
      setUser(null);
      setStatus('unauthenticated');
      navigate('/login');
    });
    if (tokenStorage.getAccess()) refreshUser();
    else setStatus('unauthenticated');
  }, [refreshUser, navigate]);

  const login = useCallback(async (payload: LoginPayload) => {
    const res = await authService.login(payload);
    tokenStorage.setTokens(res.accessToken, res.refreshToken);
    setUser(res.user);
    setStatus('authenticated');
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const res = await authService.register(payload);
    tokenStorage.setTokens(res.accessToken, res.refreshToken);
    setUser(res.user);
    setStatus('authenticated');
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // ignore — clear local state regardless
    }
    tokenStorage.clear();
    setUser(null);
    setStatus('unauthenticated');
    navigate('/login');
  }, [navigate]);

  const value = useMemo(
    () => ({ user, status, login, register, logout, refreshUser }),
    [user, status, login, register, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useAuth } from './auth-context';
import type { Me } from '@/types/api';

interface UserContextValue {
  user: Me | null;
  isAuthenticated: boolean;
  isPremium: boolean;
  emailVerified: boolean;
  refresh: () => Promise<void>;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const { status, refreshUser, user } = useAuth();

  const value = useMemo<UserContextValue>(
    () => ({
      user,
      isAuthenticated: status === 'authenticated',
      isPremium: !!user?.isPremium,
      emailVerified: !!user?.emailVerified,
      refresh: refreshUser,
    }),
    [user, status, refreshUser],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser debe usarse dentro de <UserProvider>');
  return ctx;
}

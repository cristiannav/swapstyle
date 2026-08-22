import type { ReactNode } from 'react';
import { AuthProvider } from '@/contexts/auth-context';
import { ToastProvider } from '@/contexts/toast-context';
import { UserProvider } from '@/contexts/user-context';
import { FiltersProvider } from '@/contexts/filters-context';
import { NotificationsProvider } from '@/contexts/notifications-context';
import { ChatProvider } from '@/contexts/chat-context';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <AuthProvider>
        <UserProvider>
          <NotificationsProvider>
            <ChatProvider>
              <FiltersProvider>{children}</FiltersProvider>
            </ChatProvider>
          </NotificationsProvider>
        </UserProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

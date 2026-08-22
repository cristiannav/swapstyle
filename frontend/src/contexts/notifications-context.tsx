import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Match, Message } from '@/types/api';

export interface Notification {
  id: string;
  kind: 'match' | 'message';
  matchId: string;
  text: string;
  read: boolean;
  createdAt: string;
}

interface NotificationsContextValue {
  notifications: Notification[];
  unreadCount: number;
  push: (n: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clear: () => void;
  pushMatch: (match: Match) => void;
  pushMessage: (matchId: string, message: Message, currentUserId: string) => void;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

const MAX = 20;

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const push = useCallback<NotificationsContextValue['push']>((n) => {
    setNotifications((prev) =>
      [
        {
          id: Math.random().toString(36).slice(2),
          createdAt: new Date().toISOString(),
          read: false,
          ...n,
        },
        ...prev,
      ].slice(0, MAX),
    );
  }, []);

  const pushMatch = useCallback<NotificationsContextValue['pushMatch']>(
    (match) => {
      push({
        kind: 'match',
        matchId: match.id,
        text: '¡Tenés un nuevo match!',
      });
    },
    [push],
  );

  const pushMessage = useCallback<NotificationsContextValue['pushMessage']>(
    (matchId, message, currentUserId) => {
      if (message.senderId === currentUserId) return;
      push({
        kind: 'message',
        matchId,
        text: message.content.slice(0, 80),
      });
    },
    [push],
  );

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clear = useCallback(() => setNotifications([]), []);

  // Persistencia ligera entre recargas
  useEffect(() => {
    const stored = sessionStorage.getItem('swapstyle.notif');
    if (stored) {
      try {
        setNotifications(JSON.parse(stored));
      } catch {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem('swapstyle.notif', JSON.stringify(notifications));
  }, [notifications]);

  const value = useMemo<NotificationsContextValue>(
    () => ({
      notifications,
      unreadCount: notifications.filter((n) => !n.read).length,
      push,
      markAsRead,
      markAllAsRead,
      clear,
      pushMatch,
      pushMessage,
    }),
    [notifications, push, markAsRead, markAllAsRead, clear, pushMatch, pushMessage],
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications(): NotificationsContextValue {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications debe usarse dentro de <NotificationsProvider>');
  return ctx;
}

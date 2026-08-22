import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { io, type Socket } from 'socket.io-client';
import { tokenStorage } from '@/lib/storage';
import { useAuth } from './auth-context';
import { useNotifications } from './notifications-context';
import type { Match, Message } from '@/types/api';

const WS_URL = import.meta.env.VITE_WS_URL ?? 'ws://localhost:3001';

interface TypingState {
  matchId: string;
  userId: string;
  expiresAt: number;
}

interface ChatContextValue {
  socket: Socket | null;
  connected: boolean;
  joinMatch: (matchId: string) => void;
  leaveMatch: (matchId: string) => void;
  sendMessage: (matchId: string, content: string) => Promise<Message>;
  markRead: (matchId: string, messageIds: string[]) => void;
  emitTyping: (matchId: string) => void;
  onMessage: (cb: (matchId: string, message: Message) => void) => () => void;
  onRead: (cb: (event: { matchId: string; messageIds: string[]; readerId: string }) => void) => () => void;
  typingPeers: TypingState[];
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { status, user } = useAuth();
  const notifications = useNotifications();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [typingPeers, setTypingPeers] = useState<TypingState[]>([]);

  // Salas en las que estamos. En Vercel la conexión se corta al llegar al
  // maxDuration de la función: Socket.IO reconecta solo pero el server pierde
  // las salas, y sin re-emitir el join el usuario queda conectado y en silencio.
  const joinedRooms = useRef(new Set<string>());

  const messageListeners = useRef(new Set<(matchId: string, message: Message) => void>());
  const readListeners = useRef(
    new Set<(event: { matchId: string; messageIds: string[]; readerId: string }) => void>(),
  );

  useEffect(() => {
    if (status !== 'authenticated') return;
    const token = tokenStorage.getAccess();
    if (!token) return;

    const s = io(`${WS_URL}/chat`, {
      transports: ['websocket'],
      auth: { token },
      reconnection: true,
    });

    s.on('connect', () => {
      setConnected(true);
      joinedRooms.current.forEach((matchId) => s.emit('chat:join', { matchId }));
    });
    s.on('disconnect', () => setConnected(false));

    s.on('chat:message', (message: Message) => {
      messageListeners.current.forEach((cb) => cb(message.matchId, message));
      if (user) notifications.pushMessage(message.matchId, message, user.id);
    });

    s.on('chat:read', (event: { matchId: string; messageIds: string[]; readerId: string }) => {
      readListeners.current.forEach((cb) => cb(event));
    });

    s.on('chat:typing', ({ matchId, userId }: { matchId: string; userId: string }) => {
      if (userId === user?.id) return;
      setTypingPeers((prev) => {
        const next = prev.filter((p) => !(p.matchId === matchId && p.userId === userId));
        return [...next, { matchId, userId, expiresAt: Date.now() + 4000 }];
      });
    });

    s.on('match:new', (match: Match) => {
      notifications.pushMatch(match);
    });

    setSocket(s);

    return () => {
      s.disconnect();
      setSocket(null);
      setConnected(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, user?.id]);

  // Cleanup typing peers expirados
  useEffect(() => {
    if (typingPeers.length === 0) return;
    const id = setInterval(() => {
      setTypingPeers((prev) => prev.filter((p) => p.expiresAt > Date.now()));
    }, 1000);
    return () => clearInterval(id);
  }, [typingPeers.length]);

  const joinMatch = useCallback(
    (matchId: string) => {
      joinedRooms.current.add(matchId);
      socket?.emit('chat:join', { matchId });
    },
    [socket],
  );

  const leaveMatch = useCallback(
    (matchId: string) => {
      joinedRooms.current.delete(matchId);
      socket?.emit('chat:leave', { matchId });
    },
    [socket],
  );

  const sendMessage = useCallback(
    (matchId: string, content: string) => {
      return new Promise<Message>((resolve, reject) => {
        if (!socket) return reject(new Error('WS no conectado'));
        socket.emit(
          'chat:send',
          { matchId, content },
          (response: Message | { error: string }) => {
            if ('error' in response) reject(new Error(response.error));
            else resolve(response);
          },
        );
      });
    },
    [socket],
  );

  const markRead = useCallback(
    (matchId: string, messageIds: string[]) => {
      if (messageIds.length === 0) return;
      socket?.emit('chat:read', { matchId, messageIds });
    },
    [socket],
  );

  const emitTyping = useCallback(
    (matchId: string) => {
      socket?.emit('chat:typing', { matchId });
    },
    [socket],
  );

  const onMessage = useCallback<ChatContextValue['onMessage']>((cb) => {
    messageListeners.current.add(cb);
    return () => {
      messageListeners.current.delete(cb);
    };
  }, []);

  const onRead = useCallback<ChatContextValue['onRead']>((cb) => {
    readListeners.current.add(cb);
    return () => {
      readListeners.current.delete(cb);
    };
  }, []);

  const value = useMemo<ChatContextValue>(
    () => ({
      socket,
      connected,
      joinMatch,
      leaveMatch,
      sendMessage,
      markRead,
      emitTyping,
      onMessage,
      onRead,
      typingPeers,
    }),
    [socket, connected, joinMatch, leaveMatch, sendMessage, markRead, emitTyping, onMessage, onRead, typingPeers],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat(): ChatContextValue {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat debe usarse dentro de <ChatProvider>');
  return ctx;
}

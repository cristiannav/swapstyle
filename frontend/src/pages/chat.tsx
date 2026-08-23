import { Link, useParams } from 'react-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import useSWR from 'swr';
import { ArrowLeft, Send } from 'lucide-react';
import { Avatar, Button, Image, Spinner } from '@/components/ui';
import { matchesService } from '@/services/matches.service';
import { chatService } from '@/services/chat.service';
import { useChat } from '@/contexts/chat-context';
import { useUser } from '@/contexts/user-context';
import { useToast } from '@/contexts/toast-context';
import { ApiError } from '@/lib/api-error';
import { cn } from '@/lib/cn';
import { formatTime } from '@/lib/format';
import type { Match, Message } from '@/types/api';

export default function ChatPage() {
  const { id: matchId } = useParams() as { id: string };
  const { user } = useUser();
  const { show } = useToast();
  const { joinMatch, leaveMatch, sendMessage, markRead, emitTyping, onMessage, onRead, typingPeers } =
    useChat();

  const { data: match } = useSWR<Match>(`/matches/${matchId}`, () => matchesService.one(matchId));
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cargar historial inicial
  useEffect(() => {
    setLoading(true);
    chatService
      .history(matchId)
      .then((msgs) => setMessages(msgs.reverse()))
      .catch(() => show('No pudimos cargar los mensajes', 'danger'))
      .finally(() => setLoading(false));
  }, [matchId, show]);

  // Suscripción al WS
  useEffect(() => {
    joinMatch(matchId);
    const offMessage = onMessage((mid, message) => {
      if (mid !== matchId) return;
      setMessages((prev) => (prev.some((m) => m.id === message.id) ? prev : [...prev, message]));
    });
    const offRead = onRead(({ matchId: mid, messageIds }) => {
      if (mid !== matchId) return;
      setMessages((prev) =>
        prev.map((m) => (messageIds.includes(m.id) && !m.readAt ? { ...m, readAt: new Date().toISOString() } : m)),
      );
    });
    return () => {
      offMessage();
      offRead();
      leaveMatch(matchId);
    };
  }, [matchId, joinMatch, leaveMatch, onMessage, onRead]);

  // Scroll al fondo al recibir mensajes
  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length]);

  // Marcar como leídos los mensajes del peer al verlos
  useEffect(() => {
    if (!user) return;
    const unread = messages.filter((m) => m.senderId !== user.id && !m.readAt).map((m) => m.id);
    if (unread.length > 0) markRead(matchId, unread);
  }, [messages, user, matchId, markRead]);

  const handleSend = useCallback(async () => {
    const content = draft.trim();
    if (!content || sending) return;
    setSending(true);
    setDraft('');
    try {
      const msg = await sendMessage(matchId, content);
      setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
    } catch (error) {
      const m = error instanceof ApiError ? error.message : 'No pudimos enviar el mensaje';
      show(m, 'danger');
      setDraft(content);
    } finally {
      setSending(false);
    }
  }, [draft, matchId, sending, sendMessage, show]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDraft(e.target.value);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    emitTyping(matchId);
    typingTimeoutRef.current = setTimeout(() => {}, 2000);
  };

  const peer = !match || !user
    ? null
    : match.userA.id === user.id
      ? match.userB
      : match.userA;

  const peerTyping = typingPeers.some((p) => p.matchId === matchId && p.userId === peer?.id);

  return (
    <div className="flex flex-col h-app-viewport max-w-2xl mx-auto -mx-4 sm:mx-auto bg-surface md:rounded-xl md:border md:border-border overflow-hidden">
      <header className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <Link to="/matches" className="-ml-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-md hover:bg-surface-muted">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        {peer ? (
          <>
            <Avatar src={peer.avatarUrl} alt={peer.name} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate leading-tight">{peer.name}</p>
              <p className="text-xs text-text-muted">
                {peerTyping ? 'escribiendo...' : `@${peer.username}`}
              </p>
            </div>
          </>
        ) : (
          <Spinner size="sm" />
        )}
      </header>

      {match && user && (
        <ExchangePreview match={match} myId={user.id} />
      )}

      <div ref={scrollerRef} className="flex-1 overflow-y-auto p-4 space-y-2">
        {loading ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-text-muted text-sm py-10">
            Empezá la conversación enviando el primer mensaje.
          </div>
        ) : (
          messages.map((m, idx) => (
            <ChatBubble
              key={m.id}
              message={m}
              isMine={m.senderId === user?.id}
              showTime={idx === messages.length - 1 || messages[idx + 1]?.senderId !== m.senderId}
            />
          ))
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void handleSend();
        }}
        className="border-t border-border p-3 flex items-end gap-2"
      >
        <textarea
          value={draft}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Escribí un mensaje..."
          className="flex-1 min-h-11 resize-none rounded-lg border border-border bg-surface-muted px-3 py-2.5 text-base sm:text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 max-h-32"
        />
        <Button type="submit" disabled={!draft.trim() || sending} size="md">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}

function ExchangePreview({ match, myId }: { match: Match; myId: string }) {
  const iAmA = match.userA.id === myId;
  const myGarment = iAmA ? match.garmentA : match.garmentB;
  const peerGarment = iAmA ? match.garmentB : match.garmentA;
  const renderImg = (src: string | undefined, alt: string) => (
    <div className="relative h-12 w-12 shrink-0 rounded-md overflow-hidden bg-surface-muted">
      {src && <Image src={src} alt={alt} fill className="object-cover" />}
    </div>
  );

  return (
    <div className="px-4 py-2 border-b border-border bg-surface-muted/40 flex items-center gap-3 text-xs">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {renderImg(myGarment.images[0]?.url, myGarment.title)}
        <div className="min-w-0">
          <p className="text-text-muted hidden xs:block">Tu prenda</p>
          <p className="font-medium truncate">{myGarment.title}</p>
        </div>
      </div>
      <span className="text-brand-500">↔</span>
      <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
        <div className="min-w-0 text-right">
          <p className="text-text-muted hidden xs:block">Su prenda</p>
          <p className="font-medium truncate">{peerGarment.title}</p>
        </div>
        {renderImg(peerGarment.images[0]?.url, peerGarment.title)}
      </div>
    </div>
  );
}

function ChatBubble({
  message,
  isMine,
  showTime,
}: {
  message: Message;
  isMine: boolean;
  showTime: boolean;
}) {
  return (
    <div className={cn('flex flex-col', isMine ? 'items-end' : 'items-start')}>
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-3.5 py-2 text-sm whitespace-pre-wrap break-words',
          isMine
            ? 'bg-brand-500 text-white rounded-br-sm'
            : 'bg-surface-muted text-text-primary rounded-bl-sm',
        )}
      >
        {message.content}
      </div>
      {showTime && (
        <p className="text-[10px] text-text-muted mt-1 px-1">
          {formatTime(message.createdAt)}
          {isMine && message.readAt && ' · leído'}
        </p>
      )}
    </div>
  );
}

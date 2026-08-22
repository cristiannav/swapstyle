import { api } from '@/lib/http-client';
import type { Message } from '@/types/api';

export const chatService = {
  history: (matchId: string, before?: string, limit = 50) => {
    const params = new URLSearchParams();
    if (before) params.set('before', before);
    params.set('limit', String(limit));
    return api.get<Message[]>(`/matches/${matchId}/messages?${params.toString()}`);
  },
};

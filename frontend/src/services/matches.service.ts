import { api } from '@/lib/http-client';
import type { Match } from '@/types/api';

export const matchesService = {
  list: () => api.get<Match[]>('/matches'),
  one: (id: string) => api.get<Match>(`/matches/${id}`),
  archive: (id: string) => api.patch<Match>(`/matches/${id}/archive`),
  cancel: (id: string) => api.delete<void>(`/matches/${id}`),
};

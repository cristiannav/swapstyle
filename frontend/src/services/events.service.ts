import { api } from '@/lib/http-client';
import type { ISODateString, PublicUser, UUID } from '@/types/api';

export interface SwapEvent {
  id: UUID;
  title: string;
  description: string | null;
  hostId: UUID;
  host?: PublicUser;
  startsAt: ISODateString;
  endsAt: ISODateString;
  maxParticipants: number;
  status: 'scheduled' | 'live' | 'ended' | 'canceled';
  participants?: { id: UUID; userId: UUID; user?: PublicUser; joinedAt: ISODateString }[];
  createdAt: ISODateString;
}

export interface CreateEventPayload {
  title: string;
  description?: string;
  startsAt: string;
  endsAt: string;
  maxParticipants?: number;
}

export const eventsService = {
  list: () => api.get<SwapEvent[]>('/events'),
  one: (id: string) => api.get<SwapEvent>(`/events/${id}`),
  create: (payload: CreateEventPayload) => api.post<SwapEvent>('/events', payload),
  join: (id: string) => api.post<unknown>(`/events/${id}/join`),
  leave: (id: string) => api.delete<void>(`/events/${id}/leave`),
  cancel: (id: string) => api.post<SwapEvent>(`/events/${id}/cancel`),
};

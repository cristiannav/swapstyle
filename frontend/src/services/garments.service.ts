import { api } from '@/lib/http-client';
import type { Garment, GarmentCategory, GarmentCondition } from '@/types/api';

export interface CreateGarmentPayload {
  title: string;
  description?: string;
  category: GarmentCategory;
  brand?: string;
  size?: string;
  color?: string;
  condition: GarmentCondition;
  imageUrls: string[];
}

export interface UpdateGarmentPayload extends Partial<Omit<CreateGarmentPayload, 'imageUrls'>> {
  status?: 'available' | 'reserved' | 'swapped' | 'hidden';
}

export interface FeedResponse {
  items: Garment[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface FeedQuery {
  cursor?: string;
  limit?: number;
  category?: GarmentCategory[];
  size?: string;
  city?: string;
}

export const garmentsService = {
  feed: (query: FeedQuery = {}) => {
    const params = new URLSearchParams();
    if (query.cursor) params.set('cursor', query.cursor);
    if (query.limit) params.set('limit', String(query.limit));
    if (query.size) params.set('size', query.size);
    if (query.city) params.set('city', query.city);
    query.category?.forEach((c) => params.append('category', c));
    return api.get<FeedResponse>(`/garments/feed?${params.toString()}`);
  },
  mine: () => api.get<Garment[]>('/garments/me'),
  one: (id: string) => api.get<Garment>(`/garments/${id}`),
  create: (payload: CreateGarmentPayload) => api.post<Garment>('/garments', payload),
  update: (id: string, payload: UpdateGarmentPayload) =>
    api.patch<Garment>(`/garments/${id}`, payload),
  remove: (id: string) => api.delete<void>(`/garments/${id}`),
};

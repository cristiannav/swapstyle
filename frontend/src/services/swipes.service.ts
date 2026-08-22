import { api } from '@/lib/http-client';
import type { Match, SwipeAction } from '@/types/api';

export interface SwipeResult {
  matched: boolean;
  match: Match | null;
}

export const swipesService = {
  swipe: (garmentId: string, action: SwipeAction) =>
    api.post<SwipeResult>('/swipes', { garmentId, action }),
};

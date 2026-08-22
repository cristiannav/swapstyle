import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import type { Socket } from 'socket.io';

const WINDOW_MS = 10_000;
const MAX_EVENTS = 30;

interface RateState {
  hits: number[];
}

/**
 * El ThrottlerGuard global sólo cubre HTTP: los eventos del gateway no pasaban
 * por ningún límite, así que un socket autenticado podía inundar `chat:send`.
 *
 * ponytail: ventana en memoria por socket. Alcanza porque el socket vive en una
 * sola instancia; si algún día hay que limitar por usuario entre instancias,
 * mover el contador a Redis (misma forma que LoginThrottleService).
 */
@Injectable()
export class WsThrottleGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient<Socket>();
    const now = Date.now();

    const state = ((client.data.__rate as RateState | undefined) ??= { hits: [] });
    state.hits = state.hits.filter((t) => now - t < WINDOW_MS);

    if (state.hits.length >= MAX_EVENTS) {
      throw new WsException('Demasiados mensajes. Bajá un cambio.');
    }

    state.hits.push(now);
    return true;
  }
}

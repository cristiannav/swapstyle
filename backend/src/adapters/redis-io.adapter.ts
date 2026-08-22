import { Logger, type INestApplicationContext } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import type Redis from 'ioredis';
import type { Server, ServerOptions } from 'socket.io';

/**
 * IoAdapter con fanout por Redis.
 *
 * Cada instancia de Vercel tiene su propio registro de salas en memoria: sin
 * esto, dos usuarios del mismo match que caen en instancias distintas se ven
 * conectados y no reciben nada del otro. El adapter publica cada emit en un
 * canal de Redis y las demás instancias lo reparten entre sus sockets.
 */
export class RedisIoAdapter extends IoAdapter {
  private readonly logger = new Logger(RedisIoAdapter.name);
  private readonly factory: ReturnType<typeof createAdapter>;

  constructor(appOrHttpServer: INestApplicationContext | unknown, client: Redis) {
    super(appOrHttpServer as INestApplicationContext);
    // Conexiones propias, y las dos con maxRetriesPerRequest en null: el
    // subscriber queda bloqueado en modo suscripción y no puede compartirse, y
    // si un comando del adapter se rechaza nadie lo catchea, así que es una
    // unhandled rejection y Node se lleva puesto el proceso entero. En
    // serverless eso es 500 en toda la API por un problema del chat.
    const [pub, sub] = [client.duplicate({ maxRetriesPerRequest: null }), client.duplicate({ maxRetriesPerRequest: null })];
    [pub, sub].forEach((c) => c.on('error', (err: Error) => this.logger.error(`Redis del adapter: ${err.message}`)));
    this.factory = createAdapter(pub, sub);
  }

  createIOServer(port: number, options?: ServerOptions): Server {
    const server = super.createIOServer(port, options) as Server;
    server.adapter(this.factory);
    return server;
  }
}

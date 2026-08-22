import type { INestApplicationContext } from '@nestjs/common';
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
  private readonly factory: ReturnType<typeof createAdapter>;

  constructor(appOrHttpServer: INestApplicationContext | unknown, client: Redis) {
    super(appOrHttpServer as INestApplicationContext);
    // El subscriber queda bloqueado en modo suscripción y no puede correr otros
    // comandos, así que necesita conexión propia. Para publicar alcanza con la
    // compartida (una conexión menos, que en el plan free de Upstash importa).
    this.factory = createAdapter(client, client.duplicate());
  }

  createIOServer(port: number, options?: ServerOptions): Server {
    const server = super.createIOServer(port, options) as Server;
    server.adapter(this.factory);
    return server;
  }
}

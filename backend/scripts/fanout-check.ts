/**
 * Verifica el fanout entre instancias.
 *
 * Levanta dos servidores de Socket.IO separados (como dos instancias de Vercel)
 * con el adapter de Redis, conecta un cliente a cada uno, los mete en la misma
 * sala y emite desde el server A. Si el adapter está bien enganchado, el cliente
 * de B recibe el mensaje; sin adapter, B no se entera de nada.
 *
 * Necesita Redis arriba:
 *   docker compose -f ../docker/docker-compose.yml up -d redis
 *   REDIS_URL=redis://localhost:6379 npx ts-node -T scripts/fanout-check.ts
 *
 * Sale con 1 si el mensaje no cruza.
 */
import { createServer } from 'node:http';
import Redis from 'ioredis';
import { Server } from 'socket.io';
import { io as connect, type Socket as ClientSocket } from 'socket.io-client';
import { createAdapter } from '@socket.io/redis-adapter';

const url = process.env.REDIS_URL ?? 'redis://localhost:6379';
const ROOM = `fanout-check:${Date.now()}`;

const conexiones: Redis[] = [];

async function node(port: number, pub: Redis): Promise<Server> {
  const http = createServer();
  const io = new Server(http, { cors: { origin: '*' } });
  const sub = pub.duplicate();
  conexiones.push(sub);
  io.adapter(createAdapter(pub, sub));
  io.on('connection', (s) => s.join(ROOM));
  await new Promise<void>((r) => http.listen(port, r));
  return io;
}

function client(port: number): Promise<ClientSocket> {
  const s = connect(`http://localhost:${port}`, { transports: ['websocket'] });
  return new Promise((resolve, reject) => {
    s.on('connect', () => resolve(s));
    s.on('connect_error', reject);
  });
}

async function main(): Promise<void> {
  const pub = new Redis(url);
  const [a, b] = [await node(4551, pub), await node(4552, pub)];
  const [ca, cb] = [await client(4551), await client(4552)];

  const recibido = new Promise<string>((resolve, reject) => {
    cb.on('ping-check', resolve);
    setTimeout(() => reject(new Error('el cliente de B no recibió el emit de A')), 5000);
  });

  // Un respiro para que el SUBSCRIBE de cada nodo llegue a Redis: si A emite
  // antes de que B esté suscripto, el mensaje se pierde y el check miente.
  await new Promise((r) => setTimeout(r, 300));
  a.to(ROOM).emit('ping-check', 'hola');

  try {
    const payload = await recibido;
    if (payload !== 'hola') throw new Error(`payload inesperado: ${payload}`);
    console.log('OK — el emit de A llegó al cliente de B');
  } finally {
    [ca, cb].forEach((c) => c.close());
    await Promise.all([a.close(), b.close()]);
    [pub, ...conexiones].forEach((c) => c.disconnect());
  }
}

main().catch((err) => {
  console.error('FALLÓ —', (err as Error).message);
  process.exit(1);
});

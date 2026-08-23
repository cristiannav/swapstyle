/**
 * Verifica que un arranque fallido seguido de uno bueno no deje el server
 * despachando el mismo request más de una vez.
 *
 * En producción la primera conexión a Postgres se cae, api/index.ts reintenta
 * (no cachea el arranque fallido) y a partir de ahí cada request entraba a
 * Express N veces: 11 respuestas al mismo GET y 132 ERR_HTTP_HEADERS_SENT en
 * los logs, hasta morir con el heap en 1.8 GB.
 *
 * Apunta el backend a un puerto cerrado, deja fallar el primer arranque, abre
 * un proxy a Postgres para que el segundo funcione y cuenta cuántas veces el
 * LoggingInterceptor ve el mismo request. Tiene que ver exactamente uno.
 *
 *   docker compose -f ../docker/docker-compose.yml up -d postgres redis
 *   NODE_ENV=production POSTGRES_HOST=localhost POSTGRES_PORT=5499 \
 *   REDIS_HOST=localhost FRONTEND_URL=http://localhost:3000 \
 *   JWT_ACCESS_SECRET=$(openssl rand -base64 48) \
 *   JWT_REFRESH_SECRET=$(openssl rand -base64 48) \
 *   npx ts-node -T scripts/rebuild-loop-check.ts
 */
import assert from 'node:assert';
import { spawn } from 'node:child_process';
import net from 'node:net';
import server from '../api/index';

const PORT = 4499;
const DB_PROXY_PORT = Number(process.env.POSTGRES_PORT ?? 5499);
// Dónde escucha el Postgres de verdad, por si el 5432 lo tiene ocupado otro.
const DB_PORT = Number(process.env.POSTGRES_UPSTREAM_PORT ?? 5432);
const base = `http://localhost:${PORT}`;

// El LoggingInterceptor escribe una línea por request atendido: contarlas dice
// cuántas veces entró el mismo request a la cadena de Express.
let hits = 0;
const write = process.stdout.write.bind(process.stdout);
process.stdout.write = ((chunk: string | Uint8Array, ...rest: unknown[]) => {
  if (typeof chunk === 'string' && chunk.includes('GET /api/health')) hits += 1;
  return (write as (...a: unknown[]) => boolean)(chunk, ...rest);
}) as typeof process.stdout.write;

/** Acepta la conexión y no contesta nunca: así el connect de pg se cuelga
 *  hasta el connectionTimeoutMillis, igual que el pooler saturado. */
function blackhole(): net.Server {
  return net.createServer((c) => c.on('error', () => c.destroy())).listen(DB_PROXY_PORT);
}

/** Proxy TCP a Postgres, para poder abrir la base recién en el segundo arranque. */
function openDbProxy(): net.Server {
  return net
    .createServer((client) => {
      const upstream = net.connect(DB_PORT, '127.0.0.1');
      client.pipe(upstream).pipe(client);
      client.on('error', () => upstream.destroy());
      upstream.on('error', () => client.destroy());
    })
    .listen(DB_PROXY_PORT);
}

async function main(): Promise<void> {
  // 1) Base que acepta y no contesta: el primer arranque se cuelga y falla, con
  //    tráfico encima igual que en el arranque en frío de Vercel.
  const hole = blackhole();
  await new Promise<void>((r) => server.listen(PORT, r));

  const down = await fetch(`${base}/api/health`).catch((e: Error) => e);
  assert.ok(
    down instanceof Error || down.status >= 500,
    `con la base colgada se esperaba 5xx, vino ${(down as Response).status}`,
  );
  await new Promise((r) => setTimeout(r, 1000));
  hole.close();

  // 2) Base arriba: el siguiente request rearma Nest y tiene que contestar 200.
  const proxy = openDbProxy();
  await new Promise((r) => setTimeout(r, 500));
  const up = await fetch(`${base}/api/health`);
  assert.equal(up.status, 200, `con la base arriba se esperaba 200, vino ${up.status}`);

  // 3) Y un request más, ya con todo armado, tiene que atenderse una sola vez.
  hits = 0;
  const again = await fetch(`${base}/api/health`);
  assert.equal(again.status, 200, `se esperaba 200, vino ${again.status}`);
  await new Promise((r) => setTimeout(r, 1500));
  assert.equal(hits, 1, `el request se atendió ${hits} veces, tenía que ser 1`);
  // Un listener y no la cadena del build fallido apilada debajo.
  assert.equal(
    server.listenerCount('request'),
    1,
    `el server quedó con ${server.listenerCount('request')} listeners de request`,
  );

  proxy.close();
  console.log('OK — tras un arranque fallido, cada request se atiende una sola vez');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('FALLÓ —', (err as Error).message);
    process.exit(1);
  });

import 'reflect-metadata';
import { createServer, type ServerResponse } from 'node:http';
import type { Socket } from 'node:net';
import express from 'express';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter, type NestExpressApplication } from '@nestjs/platform-express';
import type Redis from 'ioredis';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/bootstrap';
import { RedisIoAdapter } from '../src/adapters/redis-io.adapter';
import { REDIS_CLIENT } from '../src/modules/redis/redis.module';

/**
 * Entrypoint para el runtime serverless de Vercel.
 *
 * Se exporta el `http.Server`, no un `(req, res) => ...`: Vercel enruta el
 * upgrade a WebSocket contra el server exportado, y el ChatGateway de Nest
 * necesita un http.Server real donde engancharse (con una app de Express
 * pelada no hay nada a qué colgarse y el gateway queda muerto).
 *
 * OJO — lo que sigue siendo distinto a un host persistente:
 *  - La conexión se corta al llegar a `maxDuration` (ver vercel.json). El
 *    cliente reconecta solo, pero tiene que re-emitir `chat:join`: eso lo
 *    resuelve chat-context.tsx en el frontend.
 *  - Corren varias instancias en paralelo, así que el fanout de Socket.IO
 *    necesita el adaptador de Redis; sin él, dos usuarios del mismo match en
 *    instancias distintas no se ven los mensajes.
 *  - Postgres y Redis tienen que ser servicios administrados accesibles por
 *    internet (Supabase y Upstash), no los contenedores de docker-compose.
 */
const expressApp = express();
const server = createServer();
let ready: Promise<void> | undefined;

// Cuánto se espera al arranque antes de contestar 503. Tiene que ser bastante
// menor que el maxDuration de vercel.json: mientras Nest no termine de armarse
// cada request encolado retiene su socket y sus buffers, así que un arranque
// colgado a los 300s son miles de requests vivos (fue un OOM de 1.8 GB).
const BOOT_TIMEOUT_MS = 15_000;

/**
 * Vercel puede mandar tráfico antes de que Nest termine de armarse. Lo que
 * llegue en esa ventana se encola y se re-emite cuando está listo, para que
 * pase por la cadena de listeners real: engine.io primero (que se antepone al
 * hacer attach) y Express después. Sin esto, un request de socket.io durante
 * un arranque en frío caía derecho en Express y volvía 404.
 */
const queued =
  (event: 'request' | 'upgrade') =>
  (...args: unknown[]) => {
    let settled = false;
    // args[1] es el ServerResponse en 'request' y el socket crudo en 'upgrade'.
    const sink = args[1] as ServerResponse | Socket;
    const bail = () => {
      if (settled) return;
      settled = true;
      if ('writeHead' in sink) {
        sink.writeHead(503, { 'content-type': 'application/json', 'retry-after': '5' });
        sink.end('{"statusCode":503,"message":"Service Unavailable","error":"Service Unavailable"}');
      } else {
        sink.destroy();
      }
    };
    const timer = setTimeout(bail, BOOT_TIMEOUT_MS);
    void init().then(
      () => {
        clearTimeout(timer);
        if (settled) return;
        settled = true;
        server.emit(event, ...args);
      },
      () => {
        clearTimeout(timer);
        bail();
      },
    );
  };

const queuedRequest = queued('request');
const queuedUpgrade = queued('upgrade');
server.on('request', queuedRequest);
server.on('upgrade', queuedUpgrade);

function init(): Promise<void> {
  // La app se arma una sola vez por instancia y se reusa entre invocaciones.
  return (ready ??= build().catch((err: unknown) => {
    // Un arranque fallido no se cachea: si la base estaba saturada por un rato,
    // dejar la promesa rechazada envenena la instancia hasta que Vercel la
    // recicle y todo lo que caiga ahí es 503 para siempre.
    ready = undefined;
    throw err;
  }));
}

async function build(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(expressApp),
    // Sin abortOnError:false, un fallo de la base mata el proceso entero
    // (abort()) en vez de propagar: la instancia se cae y Vercel arranca otra
    // que vuelve a pedirle conexión al pooler, que es lo que lo satura.
    { bufferLogs: true, abortOnError: false },
  );
  configureApp(app);
  app.useWebSocketAdapter(new RedisIoAdapter(server, app.get<Redis>(REDIS_CLIENT)));

  // Express tiene que ser listener ANTES de init(): engine.io captura la cadena
  // al hacer attach y delega en ella lo que no sea suyo. Si acá quedara el
  // listener de la cola, cada request no-socket.io se re-emitiría para siempre.
  // El remove de expressApp es para que un reintento no lo deje duplicado.
  server.removeListener('request', queuedRequest);
  server.removeListener('request', expressApp);
  server.on('request', expressApp);

  await app.init();
  server.removeListener('upgrade', queuedUpgrade);
}

// Se arranca ya, sin esperar al primer request: cuanto antes esté el listener
// de upgrade que registra el IoAdapter, más corta es la ventana de la cola.
void init().catch((err) => {
  console.error('[bootstrap] fallo al inicializar Nest', err);
});

export default server;

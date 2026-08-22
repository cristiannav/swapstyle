import 'reflect-metadata';
import { createServer } from 'node:http';
import express from 'express';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter, type NestExpressApplication } from '@nestjs/platform-express';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/bootstrap';

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
    void init().then(() => server.emit(event, ...args));
  };

const queuedRequest = queued('request');
const queuedUpgrade = queued('upgrade');
server.on('request', queuedRequest);
server.on('upgrade', queuedUpgrade);

function init(): Promise<void> {
  // La app se arma una sola vez por instancia y se reusa entre invocaciones.
  return (ready ??= build());
}

async function build(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(expressApp),
    { bufferLogs: true },
  );
  configureApp(app);
  app.useWebSocketAdapter(new IoAdapter(server));

  // Express tiene que ser listener ANTES de init(): engine.io captura la cadena
  // al hacer attach y delega en ella lo que no sea suyo. Si acá quedara el
  // listener de la cola, cada request no-socket.io se re-emitiría para siempre.
  server.removeListener('request', queuedRequest);
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

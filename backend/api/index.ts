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
let ready: Promise<void> | undefined;

// Los requests esperan a que Nest termine de armarse; si no, Express todavía no
// tiene rutas montadas y contesta 404 en el arranque en frío.
const server = createServer((req, res) => {
  void init().then(() => expressApp(req, res));
});

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
  // Antes de init(): el adaptador es lo que le da al gateway el server donde
  // escuchar los upgrades.
  app.useWebSocketAdapter(new IoAdapter(server));
  await app.init();
}

// Se arranca ya, sin esperar al primer request: el listener de upgrade que
// registra el IoAdapter tiene que existir antes de que llegue un handshake.
void init().catch((err) => {
  console.error('[bootstrap] fallo al inicializar Nest', err);
});

export default server;

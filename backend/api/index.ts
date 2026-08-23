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
const server = createServer();
let ready: Promise<void> | undefined;

/**
 * La cadena de listeners real, capturada al terminar el build: engine.io
 * adelante (que delega en Express lo que no es suyo) y Express atrás.
 *
 * La cola despacha contra esto y NO con server.emit(): re-emitir en el mismo
 * server es re-entrar en la cola, y cada vuelta dispara otra emisión. En
 * producción eso atendía el mismo GET 2, 4, 8 veces hasta morir con el heap en
 * 1.8 GB (132 ERR_HTTP_HEADERS_SENT seguidos en los logs).
 */
type Dispatch = (...args: unknown[]) => void;
let dispatch: Partial<Record<'request' | 'upgrade', Dispatch>> = {};

// Cuánto se espera al arranque antes de contestar 503. Tiene que ser bastante
// menor que el maxDuration de vercel.json: mientras Nest no termine de armarse
// cada request encolado retiene su socket y sus buffers, así que un arranque
// colgado a los 300s son miles de requests vivos (fue un OOM de 1.8 GB).
const BOOT_TIMEOUT_MS = 15_000;

/**
 * Vercel puede mandar tráfico antes de que Nest termine de armarse. Lo que
 * llegue en esa ventana se encola y se despacha contra `dispatch` cuando está
 * listo. Sin esto, un request de socket.io durante un arranque en frío caía
 * derecho en Express y volvía 404.
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
        const forward = dispatch[event];
        if (!forward) return bail();
        settled = true;
        forward(...args);
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
  // Express nuevo por intento: configureApp() monta helmet, cors y el resto
  // sobre la instancia que reciba, así que reusar la del intento fallido apila
  // la pila de middlewares una vez por rebuild.
  const expressApp = express();
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(expressApp),
    // Sin abortOnError:false, un fallo de la base mata el proceso entero
    // (abort()) en vez de propagar: la instancia se cae y Vercel arranca otra
    // que vuelve a pedirle conexión al pooler, que es lo que lo satura.
    //
    // Nada de bufferLogs: Nest sólo vacía ese buffer en app.listen(), que acá
    // no se llama nunca, así que los logs se acumulaban en memoria y no salía
    // ni una línea por stdout. Producción estaba corriendo a ciegas.
    { abortOnError: false },
  );
  configureApp(app);
  app.useWebSocketAdapter(new RedisIoAdapter(server, app.get<Redis>(REDIS_CLIENT)));

  // Express tiene que ser listener ANTES de init(): engine.io captura la cadena
  // al hacer attach y delega en ella lo que no sea suyo. Si acá quedara el
  // listener de la cola, cada request no-socket.io se re-emitiría para siempre.
  //
  // Va removeAllListeners y no un remove puntual porque esto puede correr más
  // de una vez (un arranque fallido se reintenta): cada attach de engine.io
  // envuelve la cadena anterior, así que dejar la del build previo hace que un
  // request se atienda una vez por build acumulado.
  server.removeAllListeners('request');
  server.removeAllListeners('upgrade');
  server.on('request', expressApp);

  await app.init();

  const [request] = server.listeners('request') as Dispatch[];
  const [upgrade] = server.listeners('upgrade') as Dispatch[];
  dispatch = { request, upgrade };
}

// A propósito no se arranca acá. Arrancar al evaluarse el módulo parece más
// rápido, pero Vercel congela la instancia apenas termina de cargarla y el
// connect a Postgres queda a medias: al descongelar, ese socket ya está muerto y
// el arranque se cae con "Unable to connect to the database" antes de que el
// reintento conecte de verdad. Peor todavía, si el request llega antes de que
// ese fallo se propague, se cuelga de la promesa condenada y se lleva un 503.
//
// Arrancando en el primer request no hay ventana de congelamiento en el medio:
// el request mantiene viva la instancia hasta que Nest termina de armarse. Lo
// que llegue mientras tanto lo cubre la cola, que es para lo que está.
export default server;

/**
 * Reproduce el arranque en frío de Vercel: se dispara tráfico contra el server
 * en el mismo instante en que empieza a escuchar, mientras Nest todavía se está
 * armando. Sirve para verificar que api/index.ts encola lo que llega en esa
 * ventana en vez de mandarlo derecho a Express (que devolvía 404 en socket.io).
 *
 * Necesita Postgres y Redis arriba:
 *   docker compose -f ../docker/docker-compose.yml up -d postgres redis
 *   NODE_ENV=production POSTGRES_HOST=localhost REDIS_HOST=localhost \
 *   FRONTEND_URL=http://localhost:3000 \
 *   JWT_ACCESS_SECRET=$(openssl rand -base64 48) \
 *   JWT_REFRESH_SECRET=$(openssl rand -base64 48) \
 *   npx ts-node -T scripts/coldstart-check.ts
 *
 * Sale con 1 si alguna de las tres pruebas falla.
 */
import WebSocket from 'ws';
import server from '../api/index';

const PORT = 4444;
const results: Record<string, string> = {};

async function main() {
  // listen() apenas se evalúa el módulo, igual que hace Vercel: el tráfico
  // entra mientras Nest todavía se está armando.
  await new Promise<void>((r) => server.listen(PORT, r));
  console.log('listening — disparando tráfico YA (cold start)\n');

  const polling = fetch(`http://localhost:${PORT}/socket.io/?EIO=4&transport=polling`)
    .then((r) => { results['socket.io polling'] = `HTTP ${r.status}`; })
    .catch((e) => { results['socket.io polling'] = `error ${e.message}`; });

  const health = fetch(`http://localhost:${PORT}/api/health`)
    .then((r) => { results['GET /api/health'] = `HTTP ${r.status}`; })
    .catch((e) => { results['GET /api/health'] = `error ${e.message}`; });

  const ws = new Promise<void>((resolve) => {
    const s = new WebSocket(`ws://localhost:${PORT}/socket.io/?EIO=4&transport=websocket`);
    const t = setTimeout(() => { results['upgrade WebSocket'] = 'timeout'; s.terminate(); resolve(); }, 15000);
    s.on('open', () => { clearTimeout(t); results['upgrade WebSocket'] = 'ABIERTO'; s.close(); resolve(); });
    s.on('unexpected-response', (_q, r) => { clearTimeout(t); results['upgrade WebSocket'] = `HTTP ${r.statusCode}`; resolve(); });
    s.on('error', (e) => { clearTimeout(t); results['upgrade WebSocket'] ??= `error ${e.message}`; resolve(); });
  });

  await Promise.all([polling, health, ws]);
  console.log('--- durante el arranque en frío ---');
  Object.entries(results).forEach(([k, v]) => console.log(`  ${k.padEnd(20)} ${v}`));

  console.log('--- ya caliente ---');
  console.log(`  socket.io polling    HTTP ${(await fetch(`http://localhost:${PORT}/socket.io/?EIO=4&transport=polling`)).status}`);
  console.log(`  GET /api/health      HTTP ${(await fetch(`http://localhost:${PORT}/api/health`)).status}`);

  const fail = Object.values(results).some((v) => !/HTTP 200|ABIERTO/.test(v));
  process.exit(fail ? 1 : 0);
}

main();

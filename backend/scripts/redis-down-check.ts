/**
 * Verifica que un Redis inalcanzable degrade el servicio en vez de matarlo.
 *
 * Apunta el backend a una IP que no contesta y comprueba tres cosas: que el
 * proceso siga vivo (una rejection sin dueño dentro del adapter de Socket.IO se
 * llevaba puesto todo y devolvía 500 en la API entera), que el liveness siga
 * respondiendo 200, y que el readiness diga 503 en vez de mentir.
 *
 * Necesita sólo Postgres:
 *   POSTGRES_PORT=5434 docker compose -f ../docker/docker-compose.yml up -d postgres
 *   NODE_ENV=production POSTGRES_HOST=localhost POSTGRES_PORT=5434 \
 *   REDIS_HOST=10.255.255.1 FRONTEND_URL=http://localhost:3000 \
 *   JWT_ACCESS_SECRET=$(openssl rand -base64 48) \
 *   JWT_REFRESH_SECRET=$(openssl rand -base64 48) \
 *   npx ts-node -T scripts/redis-down-check.ts
 *
 * Sale con 1 si alguna prueba falla.
 */
import assert from 'node:assert';
import server from '../api/index';

const PORT = 4477;
const base = `http://localhost:${PORT}`;

async function main(): Promise<void> {
  await new Promise<void>((r) => server.listen(PORT, r));
  // Margen para que ioredis agote sus reintentos: el crash aparecía recién
  // cuando la conexión se daba por perdida, no al primer error.
  await new Promise((r) => setTimeout(r, 8000));

  const live = await fetch(`${base}/api/health`);
  assert.equal(live.status, 200, `liveness devolvió ${live.status}, se esperaba 200`);

  const ready = await fetch(`${base}/api/health/ready`);
  assert.equal(ready.status, 503, `readiness devolvió ${ready.status}, se esperaba 503`);

  console.log('OK — con Redis caído: proceso vivo, liveness 200, readiness 503');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('FALLÓ —', (err as Error).message);
    process.exit(1);
  });

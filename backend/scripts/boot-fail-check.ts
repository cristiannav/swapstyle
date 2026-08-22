/**
 * Verifica que un arranque que no puede conectar a la base degrade a 503 en
 * lugar de colgar el request.
 *
 * Con Postgres inalcanzable, `NestFactory.create` se quedaba esperando (el
 * connect de pg no tiene timeout por defecto) y todo lo que llegaba mientras
 * tanto se encolaba reteniendo su socket hasta el maxDuration de Vercel: 300s
 * de requests acumulados terminaban en un OOM de 1.8 GB. Además el fallo se
 * cacheaba en la promesa, así que la instancia no se recuperaba nunca.
 *
 * No necesita ningún servicio arriba:
 *   NODE_ENV=production POSTGRES_HOST=192.0.2.1 REDIS_HOST=192.0.2.1 \
 *   FRONTEND_URL=http://localhost:3000 \
 *   JWT_ACCESS_SECRET=$(openssl rand -base64 48) \
 *   JWT_REFRESH_SECRET=$(openssl rand -base64 48) \
 *   npx ts-node -T scripts/boot-fail-check.ts
 *
 * Sale con 1 si alguna prueba falla.
 */
import assert from 'node:assert';
import server from '../api/index';

const PORT = 4479;
const base = `http://localhost:${PORT}`;
// El 503 tiene que llegar por el connect timeout de pg (8s) o, en el peor caso,
// por el BOOT_TIMEOUT_MS del entrypoint (15s). Nunca por el corte de Vercel.
const LIMITE_MS = 25_000;

async function pedir(): Promise<{ status: number; ms: number }> {
  const t0 = Date.now();
  const res = await fetch(`${base}/api/health`);
  return { status: res.status, ms: Date.now() - t0 };
}

async function main(): Promise<void> {
  await new Promise<void>((r) => server.listen(PORT, r));

  const primera = await pedir();
  assert.equal(primera.status, 503, `primer request devolvió ${primera.status}, se esperaba 503`);
  assert.ok(primera.ms < LIMITE_MS, `tardó ${primera.ms}ms, más que el límite de ${LIMITE_MS}ms`);

  // La segunda prueba que el fallo no quedó cacheado: si la promesa rechazada
  // se reusara, esto contestaría al instante y sin volver a intentar el arranque.
  const segunda = await pedir();
  assert.equal(segunda.status, 503, `segundo request devolvió ${segunda.status}, se esperaba 503`);
  assert.ok(segunda.ms > 500, `el segundo request no reintentó el arranque (${segunda.ms}ms)`);

  console.log(`OK — 503 en ${primera.ms}ms y reintento en ${segunda.ms}ms, sin colgarse`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  });

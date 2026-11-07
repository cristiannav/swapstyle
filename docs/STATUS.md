# Estado del proyecto SwapStyle

**Última actualización:** 2026-08-23

## Resumen

50 / 52 tareas completadas (96%). Las 2 restantes están **Bloqueadas** porque requieren credenciales externas / setup en consolas de terceros que no se pueden generar desde el código.

| Fase | Completado | Pendiente | Estado |
|---|---|---|---|
| Fase 0 — Setup | 11/11 | — | ✅ |
| Fase 1 — Auth & Usuarios | 17/18 | OAuth Google/Facebook | 🟡 |
| Fase 2 — Prendas & Swipe | 8/8 | — | ✅ |
| Fase 3 — Match & Chat | 7/7 | — | ✅ |
| Fase 4 — Features Premium | 3/4 | FCM Push | 🟡 |
| Fase 5 — Lanzamiento | 3/3 | — | ✅ |

## En producción

Backend y frontend están desplegados en Vercel y funcionando. Detalle completo
(recursos, variables, problemas conocidos) en [DEPLOY.md](DEPLOY.md).

| | |
|---|---|
| Frontend | https://swapstyle-prod.vercel.app |
| Backend | https://swapstyle-backend.vercel.app |
| Base | Supabase `sa-east-1`, migrada y con el seed corrido |
| Redis | Upstash |
| Salud | `/api/health/ready` → 200 (`database: ok`, `redis: ok`), ~2s en frío y ~0.6s en caliente |
| Keep-alive | Cron diario de Vercel a `/api/health/ready` (`backend/vercel.json`). Supabase free pausa el proyecto tras una semana sin tráfico y el backend queda en 503 — no sacarlo |

El chat en vivo corre sobre Fluid Compute con el fanout entre instancias por
Redis. El entrypoint serverless (`backend/api/index.ts`) es la parte delicada:
arma Nest en el primer request y encola lo que llegue mientras tanto. Los cuatro
modos de falla que rompieron producción quedaron cubiertos por scripts, que hay
que correr antes de tocar ese archivo:

```bash
cd backend
npx ts-node -T scripts/coldstart-check.ts      # tráfico durante el arranque
npx ts-node -T scripts/rebuild-loop-check.ts   # un request se atiende una sola vez
npx ts-node -T scripts/boot-fail-check.ts      # base caída → 503, no cuelga
npx ts-node -T scripts/redis-down-check.ts     # Redis caído → degrada, no muere
```

## Responsive

La app entra sin scroll horizontal de 320px a 1920px, incluido el teléfono
apaisado. Lo que hay que saber antes de tocar layout:

- Las variantes propias viven en `frontend/src/globals.css`: `short`
  (alto ≤ 700px), `short-landscape` (alto ≤ 540px y apaisado, el feed pasa a
  fila) y `mouse` (`hover: hover` + `pointer: fine`). El ancho no alcanza:
  una tablet mide 768px y se toca con el dedo, así que los controles que
  achican a tamaño de mouse usan `mouse:`, no `md:`.
- `.h-app-viewport` (mismo archivo) es el alto de una pantalla dentro de
  `<main>`. Está en `dvh` a propósito: con `vh`, la barra de direcciones del
  navegador móvil tapaba el último mensaje del chat. Depende del padding de
  `app-layout` — si cambia, hay que cambiar esos dos números.
- Los inputs van `text-base sm:text-sm`: abajo de 16px iOS hace zoom solo al
  enfocar y ya no vuelve.
- Objetivos táctiles de 44px (`min-h-11`) en todo lo que se toca con el dedo.

El guardrail es `frontend/e2e/responsive.spec.ts`: 4 rutas públicas × 320 y
1024. El caso que lo justifica es el mazo decorativo del home — una carta
rotada 8° ocupa una caja ~17% más ancha que la carta, y en 1024 se iba de la
pantalla. En 320 desbordaba hacia la izquierda, que no genera scrollbar: por
eso el test mira los dos anchos y no sólo el teléfono.

```bash
npx playwright test responsive
```

## Tareas Bloqueadas

### OAuth2 con Google y Facebook
**Por qué:** Requiere apps registradas en Google Cloud Console y Meta for Developers, con `client_id`/`client_secret` y URLs de callback verificadas. La estructura del backend (Passport, env vars en `JwtConfig`/`OAuthConfig`) ya está lista; faltan únicamente las credenciales y el strategy file.

**Para destrabar:**
1. Crear app OAuth en `console.cloud.google.com` y `developers.facebook.com`.
2. Setear `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `FACEBOOK_CLIENT_ID`, `FACEBOOK_CLIENT_SECRET` en `.env`.
3. Agregar `GoogleStrategy`/`FacebookStrategy` en `backend/src/modules/auth/strategies/` siguiendo el patrón de `JwtStrategy`.
4. Endpoints: `GET /auth/google` y `GET /auth/google/callback` (idem Facebook).

### Notificaciones push con FCM
**Por qué:** Requiere proyecto en Firebase Console + `service account` JSON.

**Para destrabar:**
1. Crear proyecto en `console.firebase.google.com`.
2. Generar service account, guardar JSON en `backend/credentials/firebase.json` (gitignored).
3. Instalar `firebase-admin` y crear `NotificationsModule` con `admin.messaging().send()`.
4. Agregar tabla `device_tokens` (user_id, token, platform).

## Cómo arrancar

```bash
# Levantar Postgres + Redis
npm run docker:up

# Aplicar migración inicial
cd backend && npm install && npm run migration:run

# Backend (puerto 3001)
cd backend && npm run start:dev

# Frontend (puerto 3000)
cd frontend && npm install && npm run dev
```

## Endpoints principales

- `POST /api/auth/register` · `POST /api/auth/login` · `POST /api/auth/refresh`
- `POST /api/auth/forgot-password` · `POST /api/auth/reset-password`
- `GET /api/users/me` · `PATCH /api/users/me`
- `POST /api/garments` · `GET /api/garments/feed` · `GET /api/garments/me`
- `POST /api/swipes` (devuelve `{matched, match}`)
- `GET /api/matches` · `GET /api/matches/:id`
- `GET /api/matches/:matchId/messages`
- `GET /api/events` · `POST /api/events` · `POST /api/events/:id/join`
- `GET /api/health` · `GET /api/health/ready`

## WebSocket (`/chat` namespace)

- `chat:join { matchId }` → unirse a la room
- `chat:send { matchId, content }` → enviar mensaje
- `chat:read { matchId, messageIds }` → marcar leídos
- `chat:typing { matchId }` → emitir typing
- Eventos recibidos: `chat:message`, `chat:read`, `chat:typing`, `match:new`

## Documentación

- `docs/diagrams/01-der.md` — Modelo de datos
- `docs/diagrams/02-c4-architecture.md` — Arquitectura C4
- `docs/diagrams/03-sequence.md` — Diagramas de secuencia
- `docs/diagrams/04-mvp-roadmap.md` — Roadmap por fases
- `docs/DEPLOY.md` — Despliegue en Vercel y problemas conocidos
- `docs/business-model.md` — Modelo de negocio (BMC, ingresos, KPIs)

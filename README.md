# SwapStyle

> Swap & Match: Dating App de Moda. Híbrido entre Tinder y swap app donde "matcheas" con personas que tienen prendas que te interesan y viceversa.

## Mecánicas

- Swipe right en prendas que te gustan
- Match cuando ambos están interesados
- Chat integrado para negociar intercambio
- Super Likes para prendas premium
- Eventos de speed-swapping

## Stack

- **Backend:** Node.js 20 + NestJS 10 + TypeORM + PostgreSQL 16 + Redis 7
- **Frontend:** React 19 (SPA) + Vite 8 + React Router 7 + TypeScript 5 + TailwindCSS 4
- **Realtime:** Socket.IO (chat)
- **Auth:** JWT (access + refresh) + Passport
- **Infra:** Docker + Docker Compose

## Estructura

```
swapstyle/
├── apps/
│   ├── backend/          # NestJS API
│   └── frontend/         # React + Vite (SPA)
├── packages/             # Código compartido (tipos, utils)
├── docker/               # Dockerfiles + docker-compose
└── docs/
    └── diagrams/         # DER, C4, secuencia
```

## Quickstart

```bash
# Levantar Postgres + Redis
npm run docker:up

# Backend (puerto 3001)
npm run dev:backend

# Frontend (puerto 3000)
npm run dev:frontend
```

## MVP por Fases

- **Fase 0** — Setup (monorepo, Docker, esquema DB, design system)
- **Fase 1** — Auth & Usuarios (JWT, registro, login, perfil)
- **Fase 2** — Prendas & Swipe (carga de prendas, feed con swipe)
- **Fase 3** — Match & Chat (detección de match, chat WebSocket)
- **Fase 4** — Features Premium (Super Likes, eventos speed-swap)
- **Fase 5** — Lanzamiento (tests, monitoreo, despliegue)

## Convenciones de Commits

[Conventional Commits](https://www.conventionalcommits.org/):

```
feat(auth): agregar refresh token
fix(swipe): corregir detección de match duplicado
docs(readme): actualizar quickstart
chore(deps): actualizar nestjs a v10.4
```

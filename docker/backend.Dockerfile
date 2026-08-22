# syntax=docker/dockerfile:1.7
# Build context is the repo root (see docker-compose.yml `context: ..`).
# backend/ is a standalone npm project (its own package.json + lockfile),
# NOT an npm workspace.

# ===== deps =====
FROM node:20-alpine AS deps
WORKDIR /app
COPY backend/package.json backend/package-lock.json* ./
RUN npm ci

# ===== build =====
FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY backend/ ./
RUN npm run build
RUN npm prune --omit=dev

# ===== production =====
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -S app && adduser -S app -G app
COPY --from=build --chown=app:app /app/dist ./dist
COPY --from=build --chown=app:app /app/node_modules ./node_modules
COPY --from=build --chown=app:app /app/package.json ./package.json
USER app
EXPOSE 3001
CMD ["node", "dist/main.js"]

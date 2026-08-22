# syntax=docker/dockerfile:1.7
# Build context is the repo root (see docker-compose.yml `context: ..`).
# frontend/ is a standalone React + Vite SPA (its own package.json + lockfile).

# ===== deps =====
FROM node:20-alpine AS deps
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci

# ===== build =====
FROM node:20-alpine AS build
WORKDIR /app
# VITE_* are inlined into the client bundle at build time. .env is
# dockerignored, so pass them as build args (defaults match local dev).
ARG VITE_API_URL=http://localhost:3001/api
ARG VITE_WS_URL=ws://localhost:3001
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_WS_URL=$VITE_WS_URL
COPY --from=deps /app/node_modules ./node_modules
COPY frontend/ ./
RUN npm run build

# ===== production =====
# Static bundle served by nginx; every unknown path falls back to index.html
# so client-side routes survive a hard refresh / deep link.
FROM nginx:1.27-alpine AS production
COPY docker/frontend-nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 3000

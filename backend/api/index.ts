import 'reflect-metadata';
import express from 'express';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter, type NestExpressApplication } from '@nestjs/platform-express';
import type { Request, Response } from 'express';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/bootstrap';

/**
 * Entrypoint para el runtime serverless de Vercel.
 *
 * OJO — limitaciones reales de esta plataforma para este backend:
 *  - El ChatGateway (Socket.IO) NO funciona acá: las funciones no mantienen
 *    conexiones abiertas. El chat en tiempo real necesita un host con proceso
 *    persistente (Railway / Render / Fly / VPS con el Dockerfile que ya existe).
 *  - Postgres y Redis tienen que ser servicios administrados accesibles por
 *    internet (Neon/Supabase y Upstash), no los contenedores de docker-compose.
 *  - Cada instancia fría abre su propio pool: conviene un pooler (PgBouncer,
 *    Neon serverless driver) o el límite de conexiones se agota.
 */
const server = express();
let ready: Promise<void> | undefined;

async function init(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(server),
    { bufferLogs: true },
  );
  configureApp(app);
  await app.init();
}

export default async function handler(req: Request, res: Response): Promise<void> {
  // La app se arma una sola vez por instancia y se reusa entre invocaciones.
  ready ??= init();
  await ready;
  server(req, res);
}

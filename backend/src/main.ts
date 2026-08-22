import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import type { NestExpressApplication } from '@nestjs/platform-express';
import type Redis from 'ioredis';
import { AppModule } from './app.module';
import { configureApp } from './bootstrap';
import { RedisIoAdapter } from './adapters/redis-io.adapter';
import { REDIS_CLIENT } from './modules/redis/redis.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

  configureApp(app);
  // Mismo adapter que en serverless, para que no dependa del entrypoint: con
  // una sola réplica es un rodeo por Redis, con más de una es lo que hace que
  // el chat funcione.
  app.useWebSocketAdapter(new RedisIoAdapter(app, app.get<Redis>(REDIS_CLIENT)));

  const port = app.get(ConfigService).get<number>('app.port') ?? 3001;
  await app.listen(port);

  console.log(`[SwapStyle] Backend listening on http://localhost:${port}/api`);
}

bootstrap();

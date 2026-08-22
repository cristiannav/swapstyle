import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { configureApp } from './bootstrap';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

  configureApp(app);

  const port = app.get(ConfigService).get<number>('app.port') ?? 3001;
  await app.listen(port);

  console.log(`[SwapStyle] Backend listening on http://localhost:${port}/api`);
}

bootstrap();

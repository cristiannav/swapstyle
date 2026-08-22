import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

/**
 * Todo lo que configura la app menos el `listen`, para que el server de siempre
 * (`main.ts`) y la función serverless (`api/index.ts`) no puedan divergir.
 * Si esto se duplicara, un deploy se quedaría sin helmet o sin el ValidationPipe.
 */
export function configureApp(app: NestExpressApplication): void {
  const config = app.get(ConfigService);
  const isProd = config.get<string>('app.env') === 'production';

  // Detrás de nginx/Vercel, req.ip es la IP del proxy salvo que confiemos en
  // X-Forwarded-For. Sin esto, el throttler y el bloqueo por IP cuentan todo
  // el tráfico como un único cliente.
  app.set('trust proxy', 1);

  app.setGlobalPrefix('api');
  app.use(
    helmet({
      // La UI de Swagger usa scripts/estilos inline que la CSP por defecto
      // bloquea. Swagger sólo se monta fuera de producción, así que la CSP
      // queda activa justo donde importa.
      contentSecurityPolicy: isProd ? undefined : false,
      hsts: isProd ? { maxAge: 31_536_000, includeSubDomains: true, preload: true } : false,
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );
  app.use(compression());
  app.use(cookieParser());

  // La lista ya viene parseada; app.frontendUrl es sólo el origen canónico.
  const allowedOrigins = config.getOrThrow<string[]>('app.corsOrigins');

  app.enableCors({
    origin: allowedOrigins.length === 1 ? allowedOrigins[0] : allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    maxAge: 86_400,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    // Strips @Exclude()'d fields (e.g. User.passwordHash) from every response.
    new ClassSerializerInterceptor(app.get(Reflector)),
  );

  if (!isProd) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('SwapStyle API')
      .setDescription('Swap & Match — Dating App de Moda')
      .setVersion('0.1.0')
      .addBearerAuth()
      .build();
    SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, swaggerConfig));
  }
}

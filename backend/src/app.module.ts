import { Module, type ExecutionContext } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import type Redis from 'ioredis';
import { APP_GUARD } from '@nestjs/core';
import { configuration } from './config/configuration';
import { envValidationSchema } from './config/env.validation';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './common/health/health.module';
import { RedisModule, REDIS_CLIENT } from './modules/redis/redis.module';
import { SecurityModule } from './modules/security/security.module';
import { MailModule } from './modules/mail/mail.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { GarmentsModule } from './modules/garments/garments.module';
import { SwipesModule } from './modules/swipes/swipes.module';
import { MatchesModule } from './modules/matches/matches.module';
import { ChatModule } from './modules/chat/chat.module';
import { EventsModule } from './modules/events/events.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema: envValidationSchema,
      validationOptions: { abortEarly: true },
      envFilePath: ['.env', '../../.env'],
    }),
    // El storage por defecto es un Map en memoria que decrementa los contadores
    // con setTimeout. En serverless eso no funciona: la instancia se suspende
    // entre invocaciones, los timers no corren, el contador nunca baja y todo
    // termina en 429 permanente. Además cada instancia contaba por su cuenta,
    // así que el límite real era el configurado por la cantidad de instancias.
    ThrottlerModule.forRootAsync({
      imports: [RedisModule],
      inject: [REDIS_CLIENT],
      useFactory: (redis: Redis) => ({
        storage: new ThrottlerStorageRedisService(redis),
        // Las probes de liveness pegan cada pocos segundos y el throttler las
        // cortaba a 429, que un monitoreo lee como caído; y ahora que el estado
        // vive en Redis, Redis abajo dejaba al health sin poder contestar. Va
        // acá y no con @SkipThrottle() en el controller porque con throttlers
        // nombrados el decorador exige nombrarlos uno por uno, y esa lista se
        // desincroniza en cuanto alguien agregue un tier.
        skipIf: (ctx: ExecutionContext) =>
          ctx.getType() === 'http' &&
          (ctx.switchToHttp().getRequest<{ path?: string }>().path ?? '').startsWith('/api/health'),
        throttlers: [
          { name: 'short', ttl: 1000, limit: 5 },
          { name: 'medium', ttl: 10_000, limit: 30 },
          { name: 'long', ttl: 60_000, limit: 100 },
        ],
      }),
    }),
    DatabaseModule,
    RedisModule,
    SecurityModule,
    MailModule,
    AuthModule,
    UsersModule,
    GarmentsModule,
    SwipesModule,
    MatchesModule,
    ChatModule,
    EventsModule,
    HealthModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}

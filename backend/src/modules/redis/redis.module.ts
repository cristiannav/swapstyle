import { Global, Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import type { RedisConfig } from '../../config/configuration';

export const REDIS_CLIENT = Symbol('REDIS_CLIENT');

const logger = new Logger('RedisModule');

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService): Redis => {
        const redis = config.getOrThrow<RedisConfig>('redis');
        const options = { lazyConnect: false, maxRetriesPerRequest: 3, connectTimeout: 10_000 };
        // Upstash y compañía entregan una rediss:// con password embebida;
        // ioredis la parsea (incluido el TLS) si se la pasás como string.
        const client = redis.url
          ? new Redis(redis.url, options)
          : new Redis({ ...options, host: redis.host, port: redis.port });
        // Sin listener, ioredis loguea "Unhandled error event" y cualquier
        // comando en vuelo termina en una rejection sin dueño que mata el
        // proceso. Redis caído tiene que degradar, no tirar abajo la API.
        client.on('error', (err: Error) => logger.error(`Redis: ${err.message}`));
        return client;
      },
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule {}

import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import type { RedisConfig } from '../../config/configuration';

export const REDIS_CLIENT = Symbol('REDIS_CLIENT');

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService): Redis => {
        const redis = config.getOrThrow<RedisConfig>('redis');
        const options = { lazyConnect: false, maxRetriesPerRequest: 3 };
        // Upstash y compañía entregan una rediss:// con password embebida;
        // ioredis la parsea (incluido el TLS) si se la pasás como string.
        return redis.url ? new Redis(redis.url, options) : new Redis({ ...options, host: redis.host, port: redis.port });
      },
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule {}

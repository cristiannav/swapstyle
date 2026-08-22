import { Controller, Get, Inject, ServiceUnavailableException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import type Redis from 'ioredis';
import { Public } from '../decorators/public.decorator';
import { REDIS_CLIENT } from '../../modules/redis/redis.module';

@ApiTags('health')
@Controller('health/ready')
export class ReadinessController {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  @Public()
  @Get()
  async ready() {
    const checks: Record<string, 'ok' | 'down'> = { database: 'down', redis: 'down' };

    try {
      await this.dataSource.query('SELECT 1');
      checks.database = 'ok';
    } catch {
      // queda como 'down'
    }

    try {
      const pong = await this.redis.ping();
      if (pong === 'PONG') checks.redis = 'ok';
    } catch {
      // queda como 'down'
    }

    const ok = Object.values(checks).every((v) => v === 'ok');
    if (!ok) {
      throw new ServiceUnavailableException({
        status: 'degraded',
        checks,
      });
    }

    return { status: 'ok', checks };
  }
}

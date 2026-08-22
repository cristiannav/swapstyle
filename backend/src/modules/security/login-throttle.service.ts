import { HttpException, HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { createHash } from 'crypto';
import type Redis from 'ioredis';
import { REDIS_CLIENT } from '../redis/redis.module';

const PREFIX = 'security:login:';

/** Ventana y umbrales. La cuenta es más estricta que la IP porque una IP
 *  puede ser un NAT corporativo con muchos usuarios legítimos detrás. */
const WINDOW_SECONDS = 15 * 60;
const MAX_PER_ACCOUNT = 5;
const MAX_PER_IP = 20;
const LOCK_SECONDS = 15 * 60;

/**
 * El ThrottlerGuard global limita por IP, así que un atacante que rota IPs
 * podía hacer password spraying sobre una cuenta sin tocar el límite.
 * Esto agrega un contador por cuenta, además del de IP.
 */
@Injectable()
export class LoginThrottleService {
  private readonly logger = new Logger(LoginThrottleService.name);

  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  /** Llamar ANTES de verificar la password. Lanza 429 si está bloqueado. */
  async assertNotLocked(email: string, ip?: string): Promise<void> {
    const keys = [this.accountKey(email), ...(ip ? [this.ipKey(ip)] : [])];
    const locked = await this.redis.exists(...keys.map((k) => `${k}:lock`));
    if (locked > 0) {
      throw new HttpException(
        'Demasiados intentos fallidos. Probá de nuevo en unos minutos.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  /** Llamar tras una credencial inválida. Bloquea al superar el umbral. */
  async registerFailure(email: string, ip?: string): Promise<void> {
    await this.bump(this.accountKey(email), MAX_PER_ACCOUNT, `cuenta ${this.digest(email)}`);
    if (ip) await this.bump(this.ipKey(ip), MAX_PER_IP, `ip ${ip}`);
  }

  /** Llamar tras un login exitoso: limpia el contador de la cuenta. */
  async registerSuccess(email: string): Promise<void> {
    const key = this.accountKey(email);
    await this.redis.del(key, `${key}:lock`);
  }

  private async bump(key: string, max: number, label: string): Promise<void> {
    const count = await this.redis.incr(key);
    if (count === 1) await this.redis.expire(key, WINDOW_SECONDS);
    if (count >= max) {
      await this.redis.set(`${key}:lock`, '1', 'EX', LOCK_SECONDS);
      this.logger.warn(`Login bloqueado por fuerza bruta: ${label} (${count} fallos)`);
    }
  }

  // El email se hashea: la key de Redis no debería exponer PII en un dump.
  private accountKey(email: string): string {
    return `${PREFIX}acct:${this.digest(email)}`;
  }

  private ipKey(ip: string): string {
    return `${PREFIX}ip:${ip}`;
  }

  private digest(email: string): string {
    return createHash('sha256').update(email.trim().toLowerCase()).digest('hex').slice(0, 32);
  }
}

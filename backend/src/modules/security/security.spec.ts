import { Test } from '@nestjs/testing';
import { HttpException } from '@nestjs/common';
import { LoginThrottleService } from './login-throttle.service';
import { REDIS_CLIENT } from '../redis/redis.module';
import { checkPasswordStrength } from './validators/is-strong-password';

/** Redis mínimo en memoria: sólo lo que usa el servicio. */
function fakeRedis() {
  const store = new Map<string, string>();
  return {
    store,
    incr: jest.fn(async (k: string) => {
      const next = Number(store.get(k) ?? 0) + 1;
      store.set(k, String(next));
      return next;
    }),
    expire: jest.fn(async () => 1),
    set: jest.fn(async (k: string, v: string) => {
      store.set(k, v);
      return 'OK';
    }),
    del: jest.fn(async (...keys: string[]) => {
      keys.forEach((k) => store.delete(k));
      return keys.length;
    }),
    exists: jest.fn(async (...keys: string[]) => keys.filter((k) => store.has(k)).length),
  };
}

describe('LoginThrottleService', () => {
  let service: LoginThrottleService;
  let redis: ReturnType<typeof fakeRedis>;

  beforeEach(async () => {
    redis = fakeRedis();
    const moduleRef = await Test.createTestingModule({
      providers: [LoginThrottleService, { provide: REDIS_CLIENT, useValue: redis }],
    }).compile();
    service = moduleRef.get(LoginThrottleService);
  });

  it('deja pasar mientras no se supere el umbral', async () => {
    await expect(service.assertNotLocked('a@b.com', '1.2.3.4')).resolves.toBeUndefined();
    for (let i = 0; i < 4; i++) await service.registerFailure('a@b.com', '1.2.3.4');
    await expect(service.assertNotLocked('a@b.com', '1.2.3.4')).resolves.toBeUndefined();
  });

  it('bloquea la cuenta al quinto fallo, aunque cambie la IP', async () => {
    for (let i = 0; i < 5; i++) await service.registerFailure('a@b.com', `10.0.0.${i}`);
    await expect(service.assertNotLocked('a@b.com', '10.0.0.99')).rejects.toBeInstanceOf(
      HttpException,
    );
  });

  it('un login exitoso limpia el contador y el lock', async () => {
    for (let i = 0; i < 5; i++) await service.registerFailure('a@b.com');
    await service.registerSuccess('a@b.com');
    await expect(service.assertNotLocked('a@b.com')).resolves.toBeUndefined();
  });

  it('no guarda el email en claro en las keys', async () => {
    await service.registerFailure('victima@swapstyle.test', '1.2.3.4');
    expect([...redis.store.keys()].join('|')).not.toContain('victima');
  });
});

describe('checkPasswordStrength', () => {
  it('acepta una password con minúscula, mayúscula y dígito', () => {
    expect(checkPasswordStrength('Abcd1234')).toEqual([]);
  });

  it.each([
    ['abcd1234', 'una mayúscula'],
    ['ABCD1234', 'una minúscula'],
    ['Abcdefgh', 'un número'],
    ['Ab1', 'al menos 8 caracteres'],
  ])('rechaza %s por faltarle %s', (password, missing) => {
    expect(checkPasswordStrength(password)).toContain(missing);
  });

  it('rechaza passwords que exceden el límite de argon2', () => {
    expect(checkPasswordStrength(`Aa1${'x'.repeat(80)}`)).toContain('como máximo 72 caracteres');
  });
});

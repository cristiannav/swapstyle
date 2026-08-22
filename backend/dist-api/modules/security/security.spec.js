"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const common_1 = require("@nestjs/common");
const login_throttle_service_1 = require("./login-throttle.service");
const redis_module_1 = require("../redis/redis.module");
const is_strong_password_1 = require("./validators/is-strong-password");
function fakeRedis() {
    const store = new Map();
    return {
        store,
        incr: jest.fn(async (k) => {
            const next = Number(store.get(k) ?? 0) + 1;
            store.set(k, String(next));
            return next;
        }),
        expire: jest.fn(async () => 1),
        set: jest.fn(async (k, v) => {
            store.set(k, v);
            return 'OK';
        }),
        del: jest.fn(async (...keys) => {
            keys.forEach((k) => store.delete(k));
            return keys.length;
        }),
        exists: jest.fn(async (...keys) => keys.filter((k) => store.has(k)).length),
    };
}
describe('LoginThrottleService', () => {
    let service;
    let redis;
    beforeEach(async () => {
        redis = fakeRedis();
        const moduleRef = await testing_1.Test.createTestingModule({
            providers: [login_throttle_service_1.LoginThrottleService, { provide: redis_module_1.REDIS_CLIENT, useValue: redis }],
        }).compile();
        service = moduleRef.get(login_throttle_service_1.LoginThrottleService);
    });
    it('deja pasar mientras no se supere el umbral', async () => {
        await expect(service.assertNotLocked('a@b.com', '1.2.3.4')).resolves.toBeUndefined();
        for (let i = 0; i < 4; i++)
            await service.registerFailure('a@b.com', '1.2.3.4');
        await expect(service.assertNotLocked('a@b.com', '1.2.3.4')).resolves.toBeUndefined();
    });
    it('bloquea la cuenta al quinto fallo, aunque cambie la IP', async () => {
        for (let i = 0; i < 5; i++)
            await service.registerFailure('a@b.com', `10.0.0.${i}`);
        await expect(service.assertNotLocked('a@b.com', '10.0.0.99')).rejects.toBeInstanceOf(common_1.HttpException);
    });
    it('un login exitoso limpia el contador y el lock', async () => {
        for (let i = 0; i < 5; i++)
            await service.registerFailure('a@b.com');
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
        expect((0, is_strong_password_1.checkPasswordStrength)('Abcd1234')).toEqual([]);
    });
    it.each([
        ['abcd1234', 'una mayúscula'],
        ['ABCD1234', 'una minúscula'],
        ['Abcdefgh', 'un número'],
        ['Ab1', 'al menos 8 caracteres'],
    ])('rechaza %s por faltarle %s', (password, missing) => {
        expect((0, is_strong_password_1.checkPasswordStrength)(password)).toContain(missing);
    });
    it('rechaza passwords que exceden el límite de argon2', () => {
        expect((0, is_strong_password_1.checkPasswordStrength)(`Aa1${'x'.repeat(80)}`)).toContain('como máximo 72 caracteres');
    });
});
//# sourceMappingURL=security.spec.js.map
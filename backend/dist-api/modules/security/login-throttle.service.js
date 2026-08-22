"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var LoginThrottleService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginThrottleService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const redis_module_1 = require("../redis/redis.module");
const PREFIX = 'security:login:';
const WINDOW_SECONDS = 15 * 60;
const MAX_PER_ACCOUNT = 5;
const MAX_PER_IP = 20;
const LOCK_SECONDS = 15 * 60;
let LoginThrottleService = LoginThrottleService_1 = class LoginThrottleService {
    redis;
    logger = new common_1.Logger(LoginThrottleService_1.name);
    constructor(redis) {
        this.redis = redis;
    }
    async assertNotLocked(email, ip) {
        const keys = [this.accountKey(email), ...(ip ? [this.ipKey(ip)] : [])];
        const locked = await this.redis.exists(...keys.map((k) => `${k}:lock`));
        if (locked > 0) {
            throw new common_1.HttpException('Demasiados intentos fallidos. Probá de nuevo en unos minutos.', common_1.HttpStatus.TOO_MANY_REQUESTS);
        }
    }
    async registerFailure(email, ip) {
        await this.bump(this.accountKey(email), MAX_PER_ACCOUNT, `cuenta ${this.digest(email)}`);
        if (ip)
            await this.bump(this.ipKey(ip), MAX_PER_IP, `ip ${ip}`);
    }
    async registerSuccess(email) {
        const key = this.accountKey(email);
        await this.redis.del(key, `${key}:lock`);
    }
    async bump(key, max, label) {
        const count = await this.redis.incr(key);
        if (count === 1)
            await this.redis.expire(key, WINDOW_SECONDS);
        if (count >= max) {
            await this.redis.set(`${key}:lock`, '1', 'EX', LOCK_SECONDS);
            this.logger.warn(`Login bloqueado por fuerza bruta: ${label} (${count} fallos)`);
        }
    }
    accountKey(email) {
        return `${PREFIX}acct:${this.digest(email)}`;
    }
    ipKey(ip) {
        return `${PREFIX}ip:${ip}`;
    }
    digest(email) {
        return (0, crypto_1.createHash)('sha256').update(email.trim().toLowerCase()).digest('hex').slice(0, 32);
    }
};
exports.LoginThrottleService = LoginThrottleService;
exports.LoginThrottleService = LoginThrottleService = LoginThrottleService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(redis_module_1.REDIS_CLIENT)),
    __metadata("design:paramtypes", [Function])
], LoginThrottleService);
//# sourceMappingURL=login-throttle.service.js.map
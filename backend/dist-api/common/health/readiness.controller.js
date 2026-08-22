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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReadinessController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const public_decorator_1 = require("../decorators/public.decorator");
const redis_module_1 = require("../../modules/redis/redis.module");
let ReadinessController = class ReadinessController {
    dataSource;
    redis;
    constructor(dataSource, redis) {
        this.dataSource = dataSource;
        this.redis = redis;
    }
    async ready() {
        const checks = { database: 'down', redis: 'down' };
        try {
            await this.dataSource.query('SELECT 1');
            checks.database = 'ok';
        }
        catch {
        }
        try {
            const pong = await this.redis.ping();
            if (pong === 'PONG')
                checks.redis = 'ok';
        }
        catch {
        }
        const ok = Object.values(checks).every((v) => v === 'ok');
        if (!ok) {
            throw new common_1.ServiceUnavailableException({
                status: 'degraded',
                checks,
            });
        }
        return { status: 'ok', checks };
    }
};
exports.ReadinessController = ReadinessController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ReadinessController.prototype, "ready", null);
exports.ReadinessController = ReadinessController = __decorate([
    (0, swagger_1.ApiTags)('health'),
    (0, common_1.Controller)('health/ready'),
    __param(0, (0, typeorm_1.InjectDataSource)()),
    __param(1, (0, common_1.Inject)(redis_module_1.REDIS_CLIENT)),
    __metadata("design:paramtypes", [typeorm_2.DataSource, Function])
], ReadinessController);
//# sourceMappingURL=readiness.controller.js.map
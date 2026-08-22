"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const core_1 = require("@nestjs/core");
const configuration_1 = require("./config/configuration");
const env_validation_1 = require("./config/env.validation");
const database_module_1 = require("./database/database.module");
const health_module_1 = require("./common/health/health.module");
const redis_module_1 = require("./modules/redis/redis.module");
const security_module_1 = require("./modules/security/security.module");
const mail_module_1 = require("./modules/mail/mail.module");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const garments_module_1 = require("./modules/garments/garments.module");
const swipes_module_1 = require("./modules/swipes/swipes.module");
const matches_module_1 = require("./modules/matches/matches.module");
const chat_module_1 = require("./modules/chat/chat.module");
const events_module_1 = require("./modules/events/events.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [configuration_1.configuration],
                validationSchema: env_validation_1.envValidationSchema,
                validationOptions: { abortEarly: true },
                envFilePath: ['.env', '../../.env'],
            }),
            throttler_1.ThrottlerModule.forRoot([
                { name: 'short', ttl: 1000, limit: 5 },
                { name: 'medium', ttl: 10_000, limit: 30 },
                { name: 'long', ttl: 60_000, limit: 100 },
            ]),
            database_module_1.DatabaseModule,
            redis_module_1.RedisModule,
            security_module_1.SecurityModule,
            mail_module_1.MailModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            garments_module_1.GarmentsModule,
            swipes_module_1.SwipesModule,
            matches_module_1.MatchesModule,
            chat_module_1.ChatModule,
            events_module_1.EventsModule,
            health_module_1.HealthModule,
        ],
        providers: [
            { provide: core_1.APP_GUARD, useClass: throttler_1.ThrottlerGuard },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map
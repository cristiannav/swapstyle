"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const supabase_ca_1 = require("./supabase-ca");
let DatabaseModule = class DatabaseModule {
};
exports.DatabaseModule = DatabaseModule;
exports.DatabaseModule = DatabaseModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (config) => {
                    const db = config.getOrThrow('database');
                    const isDev = config.get('app.env') === 'development';
                    return {
                        type: 'postgres',
                        ...(db.url
                            ? { url: db.url }
                            : {
                                host: db.host,
                                port: db.port,
                                username: db.username,
                                password: db.password,
                                database: db.database,
                            }),
                        ...(db.ssl ? { ssl: { ca: db.ca ?? supabase_ca_1.SUPABASE_ROOT_CA } } : {}),
                        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
                        migrations: [__dirname + '/migrations/*{.ts,.js}'],
                        synchronize: false,
                        autoLoadEntities: true,
                        retryAttempts: isDev ? 10 : 1,
                        logging: config.get('app.env') === 'development' ? ['error', 'warn'] : ['error'],
                    };
                },
            }),
        ],
    })
], DatabaseModule);
//# sourceMappingURL=database.module.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const dotenv_1 = require("dotenv");
const path_1 = require("path");
const supabase_ca_1 = require("./supabase-ca");
(0, dotenv_1.config)({ path: (0, path_1.join)(__dirname, '../../../../.env') });
(0, dotenv_1.config)({ path: (0, path_1.join)(__dirname, '../../.env') });
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    ...(process.env.DATABASE_URL
        ? { url: process.env.DATABASE_URL }
        : {
            host: process.env.POSTGRES_HOST ?? 'localhost',
            port: parseInt(process.env.POSTGRES_PORT ?? '5432', 10),
            username: process.env.POSTGRES_USER ?? 'swapstyle',
            password: process.env.POSTGRES_PASSWORD ?? 'swapstyle_dev',
            database: process.env.POSTGRES_DB ?? 'swapstyle',
        }),
    ...(process.env.POSTGRES_SSL === 'true'
        ? { ssl: { ca: process.env.POSTGRES_CA || supabase_ca_1.SUPABASE_ROOT_CA } }
        : {}),
    entities: [(0, path_1.join)(__dirname, '../**/*.entity{.ts,.js}')],
    migrations: [(0, path_1.join)(__dirname, 'migrations/*{.ts,.js}')],
    synchronize: false,
    logging: ['error', 'warn'],
});
//# sourceMappingURL=data-source.js.map
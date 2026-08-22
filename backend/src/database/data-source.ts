import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config as loadEnv } from 'dotenv';
import { join } from 'path';

loadEnv({ path: join(__dirname, '../../../../.env') });
loadEnv({ path: join(__dirname, '../../.env') });

export const AppDataSource = new DataSource({
  type: 'postgres',
  // Mismo criterio que database.module.ts: DATABASE_URL gana sobre los sueltos.
  ...(process.env.DATABASE_URL
    ? { url: process.env.DATABASE_URL }
    : {
        host: process.env.POSTGRES_HOST ?? 'localhost',
        port: parseInt(process.env.POSTGRES_PORT ?? '5432', 10),
        username: process.env.POSTGRES_USER ?? 'swapstyle',
        password: process.env.POSTGRES_PASSWORD ?? 'swapstyle_dev',
        database: process.env.POSTGRES_DB ?? 'swapstyle',
      }),
  ...(process.env.POSTGRES_SSL === 'true' ? { ssl: true } : {}),
  entities: [join(__dirname, '../**/*.entity{.ts,.js}')],
  migrations: [join(__dirname, 'migrations/*{.ts,.js}')],
  synchronize: false,
  logging: ['error', 'warn'],
});

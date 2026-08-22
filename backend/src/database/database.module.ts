import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseConfig } from '../config/configuration';
import { SUPABASE_ROOT_CA } from './supabase-ca';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const db = config.getOrThrow<DatabaseConfig>('database');
        const isDev = config.get('app.env') === 'development';
        return {
          type: 'postgres',
          // DATABASE_URL gana sobre los POSTGRES_* sueltos.
          ...(db.url
            ? { url: db.url }
            : {
                host: db.host,
                port: db.port,
                username: db.username,
                password: db.password,
                database: db.database,
              }),
          // Supabase firma con su propia CA, que no está en el almacén del
          // sistema, así que hay que pinearla. Nunca `rejectUnauthorized:
          // false`: acepta cualquier certificado y deja la conexión
          // (credenciales incluidas) abierta a un MITM.
          ...(db.ssl ? { ssl: { ca: db.ca ?? SUPABASE_ROOT_CA } } : {}),
          entities: [__dirname + '/../**/*.entity{.ts,.js}'],
          migrations: [__dirname + '/migrations/*{.ts,.js}'],
          synchronize: false,
          autoLoadEntities: true,
          // Los 10 reintentos por defecto sirven en docker-compose, donde
          // Postgres tarda en levantar. En serverless cada invocación es un
          // arranque nuevo, así que una credencial mal puesta se multiplica por
          // 10 por request y el pooler de Supabase corta el tenant entero
          // (ECIRCUITBREAKER). Fallar rápido es preferible.
          retryAttempts: isDev ? 10 : 1,
          logging: config.get('app.env') === 'development' ? ['error', 'warn'] : ['error'],
        };
      },
    }),
  ],
})
export class DatabaseModule {}

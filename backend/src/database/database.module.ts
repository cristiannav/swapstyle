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
          logging: config.get('app.env') === 'development' ? ['error', 'warn'] : ['error'],
        };
      },
    }),
  ],
})
export class DatabaseModule {}

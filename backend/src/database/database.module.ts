import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseConfig } from '../config/configuration';

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
          // `ssl: true` verifica el certificado contra las CA del sistema.
          // Neon, Supabase y RDS usan CA públicas, así que valida sin ayuda.
          // No poner `rejectUnauthorized: false`: acepta cualquier certificado
          // y deja la conexión (credenciales incluidas) abierta a un MITM.
          ...(db.ssl ? { ssl: true } : {}),
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

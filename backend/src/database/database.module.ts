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
          // Los proveedores administrados usan certificados de cadenas que el
          // contenedor no trae; verificarlos rompería la conexión.
          ...(db.ssl ? { ssl: { rejectUnauthorized: false } } : {}),
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

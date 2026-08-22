export interface AppConfig {
  env: 'development' | 'test' | 'production';
  port: number;
  /** Origen canónico, SIEMPRE uno solo. Es el que se usa para construir links
   *  que van por email (verificación, reset de password). Nunca usar la lista
   *  acá: concatenarla produce una URL rota que se lleva el token puesto. */
  frontendUrl: string;
  /** Allowlist completa para CORS y para el gateway de chat. */
  corsOrigins: string[];
}

export interface DatabaseConfig {
  /** Connection string de un proveedor administrado; si está, tiene prioridad. */
  url?: string;
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  ssl: boolean;
}

export interface RedisConfig {
  /** redis:// o rediss:// con credenciales; si está, tiene prioridad. */
  url?: string;
  host: string;
  port: number;
}

export interface JwtConfig {
  accessSecret: string;
  refreshSecret: string;
  accessTtl: string;
  refreshTtl: string;
}

export interface MailConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  from: string;
}

export interface OAuthConfig {
  google: { clientId: string; clientSecret: string };
  facebook: { clientId: string; clientSecret: string };
}

export interface Configuration {
  app: AppConfig;
  database: DatabaseConfig;
  redis: RedisConfig;
  jwt: JwtConfig;
  mail: MailConfig;
  oauth: OAuthConfig;
}

const DEFAULT_ORIGIN = 'http://localhost:3000';

export function parseOrigins(raw: string | undefined): string[] {
  const origins = (raw ?? '')
    .split(',')
    .map((o) => o.trim().replace(/\/+$/, ''))
    .filter(Boolean);
  return origins.length ? origins : [DEFAULT_ORIGIN];
}

export const configuration = (): Configuration => ({
  app: {
    env: (process.env.NODE_ENV as AppConfig['env']) ?? 'development',
    port: parseInt(process.env.BACKEND_PORT ?? '3001', 10),
    // El primero de la lista es el canónico; el resto son previews/alias.
    frontendUrl: parseOrigins(process.env.FRONTEND_URL)[0],
    corsOrigins: parseOrigins(process.env.FRONTEND_URL),
  },
  database: {
    url: process.env.DATABASE_URL || undefined,
    host: process.env.POSTGRES_HOST ?? 'localhost',
    port: parseInt(process.env.POSTGRES_PORT ?? '5432', 10),
    username: process.env.POSTGRES_USER ?? 'swapstyle',
    password: process.env.POSTGRES_PASSWORD ?? 'swapstyle_dev',
    database: process.env.POSTGRES_DB ?? 'swapstyle',
    ssl: process.env.POSTGRES_SSL === 'true',
  },
  redis: {
    url: process.env.REDIS_URL || undefined,
    host: process.env.REDIS_HOST ?? 'localhost',
    port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET!,
    refreshSecret: process.env.JWT_REFRESH_SECRET!,
    accessTtl: process.env.JWT_ACCESS_TTL ?? '15m',
    refreshTtl: process.env.JWT_REFRESH_TTL ?? '7d',
  },
  mail: {
    host: process.env.SMTP_HOST ?? '',
    port: parseInt(process.env.SMTP_PORT ?? '587', 10),
    user: process.env.SMTP_USER ?? '',
    password: process.env.SMTP_PASSWORD ?? '',
    from: process.env.EMAIL_FROM ?? 'SwapStyle <noreply@swapstyle.app>',
  },
  oauth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    },
    facebook: {
      clientId: process.env.FACEBOOK_CLIENT_ID ?? '',
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET ?? '',
    },
  },
});

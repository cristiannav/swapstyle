import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'production')
    .default('development'),
  BACKEND_PORT: Joi.number().default(3001),
  // Lista de orígenes separados por coma: Joi.uri() rechazaba "a.com,b.com".
  FRONTEND_URL: Joi.string()
    .default('http://localhost:3000')
    .custom((value: string, helpers) => {
      const origins = value.split(',').map((o) => o.trim()).filter(Boolean);
      if (!origins.length) return helpers.error('any.invalid');
      for (const origin of origins) {
        const { error } = Joi.string().uri().validate(origin);
        if (error) return helpers.error('any.invalid');
      }
      return value;
    }, 'lista de orígenes')
    .messages({ 'any.invalid': 'FRONTEND_URL debe ser una URL o varias separadas por coma' }),

  // Los proveedores administrados (Neon, Supabase, Railway) entregan una única
  // connection string. Si está, manda ella y los POSTGRES_* pasan a opcionales.
  DATABASE_URL: Joi.string().uri().optional(),
  POSTGRES_HOST: Joi.string().when('DATABASE_URL', {
    is: Joi.exist(),
    then: Joi.optional(),
    otherwise: Joi.required(),
  }),
  POSTGRES_PORT: Joi.number().default(5432),
  POSTGRES_USER: Joi.string().when('DATABASE_URL', {
    is: Joi.exist(),
    then: Joi.optional(),
    otherwise: Joi.required(),
  }),
  POSTGRES_PASSWORD: Joi.string().when('DATABASE_URL', {
    is: Joi.exist(),
    then: Joi.optional(),
    otherwise: Joi.required(),
  }),
  POSTGRES_DB: Joi.string().when('DATABASE_URL', {
    is: Joi.exist(),
    then: Joi.optional(),
    otherwise: Joi.required(),
  }),
  // Neon/Supabase/RDS exigen TLS; el Postgres de docker-compose no lo tiene.
  POSTGRES_SSL: Joi.boolean().default(false),
  // PEM de una CA propia. Si no está, se usa la de Supabase (ver supabase-ca.ts).
  POSTGRES_CA: Joi.string().allow('').optional(),

  // Idem Redis: Upstash entrega una rediss:// con password embebida.
  REDIS_URL: Joi.string().uri({ scheme: ['redis', 'rediss'] }).optional(),
  KV_URL: Joi.string().uri({ scheme: ['redis', 'rediss'] }).optional(),
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().default(6379),

  JWT_ACCESS_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  JWT_ACCESS_TTL: Joi.string().default('15m'),
  JWT_REFRESH_TTL: Joi.string().default('7d'),

  SMTP_HOST: Joi.string().allow('').default(''),
  SMTP_PORT: Joi.number().default(587),
  SMTP_USER: Joi.string().allow('').default(''),
  SMTP_PASSWORD: Joi.string().allow('').default(''),
  EMAIL_FROM: Joi.string().default('SwapStyle <noreply@swapstyle.app>'),

  GOOGLE_CLIENT_ID: Joi.string().allow('').default(''),
  GOOGLE_CLIENT_SECRET: Joi.string().allow('').default(''),
  FACEBOOK_CLIENT_ID: Joi.string().allow('').default(''),
  FACEBOOK_CLIENT_SECRET: Joi.string().allow('').default(''),
});

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configuration = void 0;
exports.parseOrigins = parseOrigins;
const DEFAULT_ORIGIN = 'http://localhost:3000';
function parseOrigins(raw) {
    const origins = (raw ?? '')
        .split(',')
        .map((o) => o.trim().replace(/\/+$/, ''))
        .filter(Boolean);
    return origins.length ? origins : [DEFAULT_ORIGIN];
}
const configuration = () => ({
    app: {
        env: process.env.NODE_ENV ?? 'development',
        port: parseInt(process.env.BACKEND_PORT ?? '3001', 10),
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
        ca: process.env.POSTGRES_CA || undefined,
    },
    redis: {
        url: process.env.REDIS_URL || process.env.KV_URL || undefined,
        host: process.env.REDIS_HOST ?? 'localhost',
        port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
    },
    jwt: {
        accessSecret: process.env.JWT_ACCESS_SECRET,
        refreshSecret: process.env.JWT_REFRESH_SECRET,
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
exports.configuration = configuration;
//# sourceMappingURL=configuration.js.map
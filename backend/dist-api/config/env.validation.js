"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.envValidationSchema = void 0;
const Joi = __importStar(require("joi"));
exports.envValidationSchema = Joi.object({
    NODE_ENV: Joi.string()
        .valid('development', 'test', 'production')
        .default('development'),
    BACKEND_PORT: Joi.number().default(3001),
    FRONTEND_URL: Joi.string()
        .default('http://localhost:3000')
        .custom((value, helpers) => {
        const origins = value.split(',').map((o) => o.trim()).filter(Boolean);
        if (!origins.length)
            return helpers.error('any.invalid');
        for (const origin of origins) {
            const { error } = Joi.string().uri().validate(origin);
            if (error)
                return helpers.error('any.invalid');
        }
        return value;
    }, 'lista de orígenes')
        .messages({ 'any.invalid': 'FRONTEND_URL debe ser una URL o varias separadas por coma' }),
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
    POSTGRES_SSL: Joi.boolean().default(false),
    POSTGRES_CA: Joi.string().allow('').optional(),
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
//# sourceMappingURL=env.validation.js.map
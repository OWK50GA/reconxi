import { createEnv } from '@t3-oss/env-core';
import * as dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

export const env = createEnv({
    server: {
        NODE_ENV: z
            .enum(['development', 'staging', 'production'])
            .default('development'),
        PORT: z.coerce.number().int().positive().default(3000),
        HOST: z.string().default('localhost'),
        CLIENT_URL: z.url().default('http://localhost:3000'),
        ALLOWED_REDIRECT_ORIGINS: z.string().default('http://localhost:3000,'), // add origins and separate with comma

        DATABASE_HOST: z.string().min(1),
        DATABASE_PORT: z.coerce.number().int().positive().default(5432),
        DATABASE_USER: z.string().min(1),
        DATABASE_PASSWORD: z.string(),
        DATABASE_NAME: z.string().min(1),
        DATABASE_SYNC: z
            .union([z.boolean(), z.enum(['true', 'false'])])
            .default(false)
            .transform((v) => v === true || v === 'true'),
        DATABASE_LOGGING: z
            .union([z.boolean(), z.enum(['true', 'false'])])
            .default(false)
            .transform((v) => v === true || v === 'true'),
        DATABASE_SSL: z
            .union([z.boolean(), z.enum(['true', 'false'])])
            .default(false)
            .transform((v) => v === true || v === 'true'),

        REDIS_HOST: z.string().default('localhost'),
        REDIS_PORT: z.coerce.number().int().positive().default(6379),
        REDIS_DEFAULT_TTL: z.coerce.number().int().positive().default(900),

        CORS_ORIGIN: z.string().default('*'),
        SWAGGER_ENABLED: z
            .union([z.boolean(), z.enum(['true', 'false'])])
            .default(true)
            .transform((v) => v === true || v === 'true'),
    },
    runtimeEnv: process.env,
    emptyStringAsUndefined: true,
});

export type Env = typeof env;
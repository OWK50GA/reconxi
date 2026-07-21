import { registerAs } from "@nestjs/config";
import { env } from "./env";

export const redisConfig = registerAs('redis', () => ({
    redisHost: env.REDIS_HOST,
    redisPort: env.REDIS_PORT,
    redisDefaultDb: 0,
    redisQueue: 2,
    redisDefaultTTL: env.REDIS_DEFAULT_TTL
}))
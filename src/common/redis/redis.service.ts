import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { type ConfigType } from "@nestjs/config";
import * as Redis from 'ioredis';
import { redisConfig } from "src/config/redis.config";

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(RedisService.name);
    private readonly clients = new Map<number, Redis.Redis>;

    constructor(
        @Inject(redisConfig.KEY)
        private readonly redisCfg: ConfigType<typeof redisConfig>,
    ){}

    onModuleInit() {
        this.getClient(this.redisCfg.redisDefaultDb);
    }

    async onModuleDestroy() {
        const quits = Array.from(this.clients.values()).map((client) => client.quit());
        await Promise.all(quits);
        this.logger.log('Redis clients closed');
    }

    getClient(db = this.redisCfg.redisDefaultDb): Redis.Redis {
        const existing = this.clients.get(db);
        if (existing) return existing;

        this.logger.log(`Connecting to Redis (DB ${db})...`);
        const client = new Redis.Redis({
            host: this.redisCfg.redisHost,
            port: this.redisCfg.redisPort,
            db,
            maxRetriesPerRequest: 3,
            enableReadyCheck: true,
        });

        client.on('connect', () => {
            this.logger.log(`Redis client connected (DB ${db})`);
        });

        client.on('error', (error) => {
            this.logger.error(`Redis client error (DB ${db}): `, error);
        });

        this.clients.set(db, client);
        return client;
    }

    /**
     * 
     * @param key this is the unique key used to store a value in redis
     * @param db this is the db in redis where it is stored. Defaults to default db
     * @returns string, which is the JSON string value
     */
    async _get(key: string, db?: number): Promise<string | null> {
        const client = this.getClient(db);
        return await client.get(`${key.toLowerCase()}`);
    }

    async _set(key: string, value: string, ttl?: number, db?: number): Promise<void> {
        const client = this.getClient(db);
        const effectiveTTL = ttl ?? this.redisCfg.redisDefaultTTL;
        if (!Number.isInteger(effectiveTTL) || effectiveTTL <= 0) throw new Error(`Invalid Redis TTL: ${effectiveTTL}`);

        await client.set(
            key,
            value, 
            'EX',
            effectiveTTL,
        );
    }

    async get<T>(key: string, db?: number): Promise<T | null> {
        const data = await this._get(key, db);
        return data ? JSON.parse(data) as T : null;
    }

    async set<T>(key: string, value: T, ttl?: number, db?: number): Promise<void> {
        return this._set(key, JSON.stringify(value), ttl, db);
    }
}
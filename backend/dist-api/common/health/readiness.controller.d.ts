import { DataSource } from 'typeorm';
import type Redis from 'ioredis';
export declare class ReadinessController {
    private readonly dataSource;
    private readonly redis;
    constructor(dataSource: DataSource, redis: Redis);
    ready(): Promise<{
        status: string;
        checks: Record<string, "ok" | "down">;
    }>;
}

import type Redis from 'ioredis';
export declare class LoginThrottleService {
    private readonly redis;
    private readonly logger;
    constructor(redis: Redis);
    assertNotLocked(email: string, ip?: string): Promise<void>;
    registerFailure(email: string, ip?: string): Promise<void>;
    registerSuccess(email: string): Promise<void>;
    private bump;
    private accountKey;
    private ipKey;
    private digest;
}

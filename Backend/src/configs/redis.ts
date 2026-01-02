import { type Duration, Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import logger from "../lib/logger.js";
import { env } from "./env.js";

let redisClient: Redis | null = null;
export function getRedisClient(): Redis {
    if (!redisClient) {
        try {
            redisClient = new Redis({
                url: env.REDIS_URL,
                token: env.REDIS_TOKEN,
            });
            logger.info("Redis client initialized successfully");
        } catch (error) {
            logger.error({ error }, "Failed to initialize Redis client");
            throw new Error("Redis initialization failed");
        }
    }
    return redisClient;
}

export const getRedisTestPrefix = () => env.NODE_ENV === "test" ? "test:" : ""

export type RateLimitParams = {
    maxRequests: number,
    timeWindow: Duration,
}
const rateLimiters = new Map<string, Ratelimit>();
export function rateLimit({ maxRequests, timeWindow }: RateLimitParams): Ratelimit {
    const prefix = getRedisTestPrefix()
    const key = `${prefix}${maxRequests}-${timeWindow}`;

    if (!rateLimiters.has(key)) {
        rateLimiters.set(key, new Ratelimit({
            redis: getRedisClient(),
            limiter: Ratelimit.slidingWindow(maxRequests, timeWindow),
            analytics: true,
            prefix,
        }));
    }

    return rateLimiters.get(key)!;
}

export const cleanupTestKeys = async () => {
    if (env.NODE_ENV !== "test") {
        logger.warn("cleanupTestKeys should only be called in test environment");
        return;
    }

    try {
        const redis = getRedisClient();
        const testKeys = await redis.keys("test:*");

        if (testKeys.length > 0) {
            logger.info(`Cleaning up ${testKeys.length} test keys`);
            await redis.del(...testKeys);
        }
    } catch (error) {
        logger.error({ error }, "Failed to cleanup test keys");
    }
}
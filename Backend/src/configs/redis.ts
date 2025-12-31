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

export type RateLimitParams = {
    maxRequests: number,
    timeWindow: Duration,
}
export function rateLimit({ maxRequests, timeWindow }: RateLimitParams): Ratelimit {
    return new Ratelimit({
        redis: getRedisClient(),
        limiter: Ratelimit.slidingWindow(maxRequests, timeWindow),
        analytics: true,
    });
}
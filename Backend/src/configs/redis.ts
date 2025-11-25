import { Redis } from "@upstash/redis";
import { env } from "./env.js";
import logger from "../lib/logger.js";

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



import { randomUUID } from "crypto"
import { getRedisClient } from "../../../configs/redis.js"
import { SessionCachePayload } from "../types.js"
import { setTimeout as sleep } from "timers/promises"
import { AppError } from "../../../errors/customError.js"
import logger from "../../../lib/logger.js"

type AcquireLockParams = {
    lockKey: string,
    cacheKey: string
    expirySeconds: number
}

export const acquireLockOrThrow = async ({ lockKey, cacheKey, expirySeconds }: AcquireLockParams) => {
    const redis = getRedisClient()
    const lockValue = randomUUID()
    const MAX_RETRIES = 5
    const INITIAL_DELAY_MS = 50
    const MAX_DELAY_MS = 400
    const BACKOFF_MULTIPLIER = 2


    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        const cached = await redis.get(cacheKey) as SessionCachePayload
        if (cached) {
            logger.debug({ attempt, cacheKey }, 'Lock acquisition: cache hit on retry')
            return { type: "cache", cachePayload: cached }
        }

        const lockAcquired = await redis.set(lockKey, lockValue, { nx: true, ex: expirySeconds })
        if (lockAcquired === "OK") {
            logger.debug({ lockKey, attempt }, 'Lock acquisition: lock acquired')
            return { type: "lock", lockValue }
        }

        const recheckCache = await redis.get(cacheKey) as SessionCachePayload
        if (recheckCache) {
            logger.debug({ attempt, cacheKey }, 'Lock acquisition: cache hit after failed lock')
            return { type: "cache", cachePayload: recheckCache }
        }

        const base = Math.min(INITIAL_DELAY_MS * Math.pow(BACKOFF_MULTIPLIER, attempt), MAX_DELAY_MS)
        const jitter = Math.floor(Math.random() * base)
        logger.debug({ attempt, delayMs: base + jitter }, 'Lock acquisition: retrying')
        await sleep(base + jitter)
    }

    const finalCacheCheck = await redis.get(cacheKey) as SessionCachePayload
    if (finalCacheCheck) {
        logger.debug({ cacheKey }, 'Lock acquisition: final cache check hit')
        return { type: "cache", cachePayload: finalCacheCheck }
    }

    logger.warn({ lockKey, maxRetries: MAX_RETRIES }, 'Lock acquisition: max retries exceeded')
    throw new AppError("SESSION_LOCK_IN_PROGRESS", { field: "session_lock" })
}
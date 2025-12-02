import { Redis } from "@upstash/redis"
import { getRedisClient } from "../../../configs/redis.js"
import { releaseLockScript } from "./scripts.js"
import logger from "../../../lib/logger.js"

type ReleaseLockParams = {
    lockKey: string
    lockValue: string
}

const loadLockScript = async (redis: Redis) => {
    let scriptSha: string
    try {
        scriptSha = await redis.scriptLoad(releaseLockScript())
        return scriptSha
    } catch {
        return null
    }
}

export const releaseLock = async ({ lockKey, lockValue }: ReleaseLockParams) => {
    const redis = getRedisClient()
    try {
        const scriptSha = await loadLockScript(redis)
        if (scriptSha === null) {
            logger.debug({ lockKey }, 'Lock release: falling back to eval (SHA not loaded)')
            await redis.eval(releaseLockScript(), [lockKey], [lockValue])
            return
        }
        await redis.evalsha(scriptSha, [lockKey], [lockValue])
    } catch (err) {
        logger.error({ error: err, lockKey }, "Failed to release lock")
    }
}
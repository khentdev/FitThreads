import { RefreshSessionParams, SessionCachePayload } from "./types.js";
import { prisma } from "../../../prisma/prismaConfig.js";
import { getCacheKey } from "./utils/cache-keys.js";
import { hashData } from "../../lib/hash.js";
import { generateTokens } from "./tokens.js";
import { getRedisClient } from "../../configs/redis.js";
import { cacheScript } from "./utils/scripts.js";
import { AppError } from "../../errors/customError.js";
import logger from "../../lib/logger.js";
import { randomUUID } from "node:crypto";
import { acquireLockOrThrow } from "./utils/acquire-lock.js";
import { releaseLock } from "./utils/release-lock.js";


export const refreshSessionService = async ({ user, deviceId, oldToken }: RefreshSessionParams) => {
    const redis = getRedisClient()

    const oldTokenHashed = hashData(oldToken)
    const oldTokenCacheKey = getCacheKey.sessionToken(oldTokenHashed)
    const requestLockKey = getCacheKey.requestLock(oldTokenHashed)

    const cached = await redis.get(oldTokenCacheKey) as SessionCachePayload
    if (cached) {
        logger.debug({ userId: user.id, source: 'early_cache_hit' }, 'Refresh session: early cache hit')
        const { accessToken } = await generateTokens({ userId: user.id, deviceId })
        return { ...cached, accessToken, csrfToken: randomUUID() }
    }

    const lockResult = await acquireLockOrThrow({ lockKey: requestLockKey, cacheKey: oldTokenCacheKey, expirySeconds: 15 })
    if (lockResult.type === "cache") {
        logger.debug({ userId: user.id, source: 'retry_cache_hit' }, 'Refresh session: cache hit during retry')
        const { accessToken } = await generateTokens({ userId: user.id, deviceId })
        return { ...(lockResult.cachePayload as SessionCachePayload), accessToken, csrfToken: randomUUID() }
    }

    try {
        logger.debug({ userId: user.id }, 'Refresh session: lock acquired, generating new token')

        const finalCacheCheck = await redis.get(oldTokenCacheKey) as SessionCachePayload
        if (finalCacheCheck) {
            logger.debug({ userId: user.id, source: 'final_cache_hit' }, 'Refresh session: final cache check hit')
            const { accessToken } = await generateTokens({ userId: user.id, deviceId })
            return { ...finalCacheCheck, accessToken, csrfToken: randomUUID() }
        }

        const { accessToken, refreshToken: newRefreshToken, refreshTokenExpiry, csrfToken } = await generateTokens({ userId: user.id, deviceId })
        const newRefreshTokenHashed = hashData(newRefreshToken)

        await prisma.$transaction(async (tx) => {
            await tx.session.create({
                data: {
                    userId: user.id,
                    token: newRefreshTokenHashed,
                    expiresAt: new Date(refreshTokenExpiry * 1000),
                }
            });
            await tx.tokenCleanupQueue.create({
                data: {
                    userId: user.id,
                    hashedToken: oldTokenHashed,
                }
            })
        });
        logger.debug({ userId: user.id }, 'Refresh session: new token stored in DB')

        const newTokenCacheKey = getCacheKey.sessionToken(newRefreshTokenHashed)
        const cachePayload: SessionCachePayload = {
            user,
            refreshToken: newRefreshToken
        }
        try {
            await redis.eval(cacheScript(), [oldTokenCacheKey, newTokenCacheKey], [30, 1200, JSON.stringify(cachePayload)])
            logger.debug({ userId: user.id, oldKeyTTL: 30, newKeyTTL: 1200 }, 'Refresh session: dual-key cache written')
        } catch (err) {
            logger.error({ error: err, userId: user.id }, "Failed to cache new session token")
        }

        return { user, accessToken, refreshToken: newRefreshToken, csrfToken }
    } catch (err) {
        logger.error({ error: err, userId: user.id }, "Failed to refresh session")
        throw new AppError("SESSION_REFRESH_FAILED", { field: "session_refresh" })
    } finally {
        await releaseLock({ lockKey: requestLockKey, lockValue: (lockResult as any).lockValue })
    }
}
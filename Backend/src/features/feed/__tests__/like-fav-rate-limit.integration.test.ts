import { afterAll, beforeAll, beforeEach, describe, expect, vi, it } from "vitest";
import { getRedisClient } from "../../../configs/redis.js";
import { Context } from "hono";
import { enforceRateLimit } from "../../../lib/rateLimit.js";
import { AppError } from "../../../errors/customError.js";

let redis: ReturnType<typeof getRedisClient> | null = null


beforeAll(() => {
    redis = getRedisClient()
})

beforeEach(async () => {
    await redis?.flushdb()
})

afterAll(async () => {
    await redis?.flushdb()
})

const createMockContext = (): Context => {
    return {
        header: vi.fn(),
    } as unknown as Context
}

describe("Like/Favorite Toggle Rate Limit Integration Tests", () => {

    const testUser = {
        id: "test-user-id",
    }
    it("should allow requests within rate limit (3 req / 1 m)", async () => {
        const mockContext = createMockContext()

        for (let i = 0; i < 3; i++) {
            await enforceRateLimit(mockContext, {
                endpoint: "feed/like-favorite-post",
                identifier: testUser.id,
                identifierType: "user",
                errorCode: "TOGGLE_LIKE_FAVORITE_RATELIMIT_EXCEEDED",
                maxRequests: 3,
                timeWindow: "1 m"
            })
        }
        expect(mockContext.header).toHaveBeenCalled()
    })

    it("should reject requests exceeding rate limit (4th request)", { timeout: 60000 }, async () => {
        const mockContext = createMockContext()

        for (let i = 0; i < 3; i++) {
            await enforceRateLimit(mockContext, {
                endpoint: "feed/like-favorite-post",
                identifier: testUser.id,
                identifierType: "user",
                errorCode: "TOGGLE_LIKE_FAVORITE_RATELIMIT_EXCEEDED",
                maxRequests: 3,
                timeWindow: "1 m"
            })
        }

        await expect(
            enforceRateLimit(mockContext, {
                endpoint: "feed/like-favorite-post",
                identifier: testUser.id,
                identifierType: "user",
                errorCode: "TOGGLE_LIKE_FAVORITE_RATELIMIT_EXCEEDED",
                maxRequests: 3,
                timeWindow: "1 m"
            })
        ).rejects.toThrow(AppError)
    })

    it("should set correct rate limit headers", { timeout: 60000 }, async () => {
        const mockContext = createMockContext()

        await enforceRateLimit(mockContext, {
            endpoint: "feed/like-favorite-post",
            identifier: testUser.id,
            identifierType: "user",
            errorCode: "TOGGLE_LIKE_FAVORITE_RATELIMIT_EXCEEDED",
            maxRequests: 3,
            timeWindow: "1 h"
        })

        expect(mockContext.header).toHaveBeenCalledWith("X-RateLimit-user-Remaining", expect.any(String))
        expect(mockContext.header).toHaveBeenCalledWith("X-RateLimit-user-Limit", "3")
        expect(mockContext.header).toHaveBeenCalledWith("X-RateLimit-user-Reset", expect.any(String))
    })

})
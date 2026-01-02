import { Context } from "hono"
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest"
import { getRedisClient } from "../../../configs/redis.js"
import { createApp } from "../../../createApp.js"
import { AppError } from "../../../errors/customError.js"
import { enforceRateLimit } from "../../../lib/rateLimit.js"


describe("Rate Limit For Create Post", () => {
    let app: ReturnType<typeof createApp> | null = null
    let redis: ReturnType<typeof getRedisClient> | null = null

    beforeAll(() => {
        app = createApp()
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

    describe("IP-based rate limiting", () => {
        it("should allow requests within rate limit (5 req / 1 min)", { timeout: 60000 }, async () => {
            const mockContext = createMockContext()
            const clientIp = "192.168.1.100"

            for (let i = 0; i < 5; i++) {
                await enforceRateLimit(mockContext, {
                    endpoint: "feed/create-post",
                    identifier: clientIp,
                    identifierType: "ip",
                    errorCode: "CREATE_POST_RATE_LIMIT_EXCEEDED",
                    maxRequests: 5,
                    timeWindow: "1 m"
                })
            }

            expect(mockContext.header).toHaveBeenCalled()
        })

        it("should reject requests exceeding rate limit (6th request)", { timeout: 60000 }, async () => {
            const mockContext = createMockContext()
            const clientIp = "192.168.1.101"

            for (let i = 0; i < 5; i++) {
                await enforceRateLimit(mockContext, {
                    endpoint: "feed/create-post",
                    identifier: clientIp,
                    identifierType: "ip",
                    errorCode: "CREATE_POST_RATE_LIMIT_EXCEEDED",
                    maxRequests: 5,
                    timeWindow: "1 m"
                })
            }

            await expect(
                enforceRateLimit(mockContext, {
                    endpoint: "feed/create-post",
                    identifier: clientIp,
                    identifierType: "ip",
                    errorCode: "CREATE_POST_RATE_LIMIT_EXCEEDED",
                    maxRequests: 5,
                    timeWindow: "1 m"
                })
            ).rejects.toThrow(AppError)
        })

        it("should set correct rate limit headers", { timeout: 60000 }, async () => {
            const mockContext = createMockContext()
            const clientIp = "192.168.1.102"

            await enforceRateLimit(mockContext, {
                endpoint: "feed/create-post",
                identifier: clientIp,
                identifierType: "ip",
                errorCode: "CREATE_POST_RATE_LIMIT_EXCEEDED",
                maxRequests: 5,
                timeWindow: "1 m"
            })

            expect(mockContext.header).toHaveBeenCalledWith("X-RateLimit-ip-Remaining", expect.any(String))
            expect(mockContext.header).toHaveBeenCalledWith("X-RateLimit-ip-Limit", "5")
            expect(mockContext.header).toHaveBeenCalledWith("X-RateLimit-ip-Reset", expect.any(String))
        })
    })

    describe("User-based rate limiting", () => {
        it("should allow requests within rate limit (3 req / 5 min)", { timeout: 60000 }, async () => {
            const mockContext = createMockContext()
            const userId = "user123"

            for (let i = 0; i < 3; i++) {
                await enforceRateLimit(mockContext, {
                    endpoint: "feed/create-post",
                    identifier: userId,
                    identifierType: "user",
                    errorCode: "CREATE_POST_RATE_LIMIT_EXCEEDED",
                    maxRequests: 3,
                    timeWindow: "5 m"
                })
            }

            expect(mockContext.header).toHaveBeenCalled()
        })

        it("should reject requests exceeding rate limit (4th request)", { timeout: 60000 }, async () => {
            const mockContext = createMockContext()
            const userId = "user456"

            for (let i = 0; i < 3; i++) {
                await enforceRateLimit(mockContext, {
                    endpoint: "feed/create-post",
                    identifier: userId,
                    identifierType: "user",
                    errorCode: "CREATE_POST_RATE_LIMIT_EXCEEDED",
                    maxRequests: 3,
                    timeWindow: "5 m"
                })
            }

            await expect(
                enforceRateLimit(mockContext, {
                    endpoint: "feed/create-post",
                    identifier: userId,
                    identifierType: "user",
                    errorCode: "CREATE_POST_RATE_LIMIT_EXCEEDED",
                    maxRequests: 3,
                    timeWindow: "5 m"
                })
            ).rejects.toThrow(AppError)
        })

        it("should isolate rate limits between different users", { timeout: 60000 }, async () => {
            const mockContext1 = createMockContext()
            const mockContext2 = createMockContext()
            const userId1 = "user789"
            const userId2 = "user012"

            for (let i = 0; i < 3; i++) {
                await enforceRateLimit(mockContext1, {
                    endpoint: "feed/create-post",
                    identifier: userId1,
                    identifierType: "user",
                    errorCode: "CREATE_POST_RATE_LIMIT_EXCEEDED",
                    maxRequests: 3,
                    timeWindow: "5 m"
                })
            }

            await expect(
                enforceRateLimit(mockContext2, {
                    endpoint: "feed/create-post",
                    identifier: userId2,
                    identifierType: "user",
                    errorCode: "CREATE_POST_RATE_LIMIT_EXCEEDED",
                    maxRequests: 3,
                    timeWindow: "5 m"
                })
            ).resolves.toBeUndefined()
        })
    })

    describe("Independent rate limit enforcement", () => {
        it("should enforce IP and user limits independently", { timeout: 60000 }, async () => {
            const mockContext = createMockContext()
            const clientIp = "192.168.1.200"
            const userId = "independentuser"

            for (let i = 0; i < 5; i++) {
                await enforceRateLimit(mockContext, {
                    endpoint: "feed/create-post",
                    identifier: clientIp,
                    identifierType: "ip",
                    errorCode: "CREATE_POST_RATE_LIMIT_EXCEEDED",
                    maxRequests: 5,
                    timeWindow: "1 m"
                })
            }

            await expect(
                enforceRateLimit(mockContext, {
                    endpoint: "feed/create-post",
                    identifier: userId,
                    identifierType: "user",
                    errorCode: "CREATE_POST_RATE_LIMIT_EXCEEDED",
                    maxRequests: 3,
                    timeWindow: "5 m"
                })
            ).resolves.toBeUndefined()
        })
    })
})
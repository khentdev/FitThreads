import { Context } from "hono"
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest"
import { cleanupTestKeys, getRedisClient } from "../../../configs/redis.js"
import { createApp } from "../../../createApp.js"
import { AppError } from "../../../errors/customError.js"
import { enforceRateLimit } from "../../../lib/rateLimit.js"

vi.mock("../../../configs/env.js", async (importOriginal) => {
    const actual = await importOriginal<typeof import("../../../configs/env.js")>()
    return {
        ...actual,
        env: {
            ...actual.env,
            RATELIMIT_SESSION_REFRESH_IP_MAX: 3,
            RATELIMIT_SESSION_REFRESH_IP_WINDOW: 60,
            RATELIMIT_SESSION_REFRESH_USER_MAX: 2,
            RATELIMIT_SESSION_REFRESH_USER_WINDOW: 60,
        }
    }
})

describe("Rate Limit For Session Refresh (validateSession)", () => {
    let app: ReturnType<typeof createApp> | null = null
    let redis: ReturnType<typeof getRedisClient> | null = null

    beforeAll(() => {
        app = createApp()
        redis = getRedisClient()
    })

    beforeEach(async () => {
        await cleanupTestKeys()
    })

    afterAll(async () => {
        await cleanupTestKeys()
    })

    const createMockContext = (): Context => {
        return {
            header: vi.fn(),
        } as unknown as Context
    }

    describe("IP-based rate limiting", () => {
        it("should allow requests within rate limit (3 req / 1 min)", { timeout: 10000 }, async () => {
            const mockContext = createMockContext()
            const clientIp = "192.168.1.100"

            for (let i = 0; i < 3; i++) {
                await enforceRateLimit(mockContext, {
                    endpoint: "session",
                    identifier: clientIp,
                    identifierType: "ip",
                    errorCode: "RATELIMIT_SESSION_EXCEEDED",
                    maxRequests: 3,
                    timeWindow: "60 s"
                })
            }

            expect(mockContext.header).toHaveBeenCalled()
        })

        it("should reject requests exceeding rate limit (4th request)", { timeout: 10000 }, async () => {
            const mockContext = createMockContext()
            const clientIp = "192.168.1.101"

            for (let i = 0; i < 3; i++) {
                await enforceRateLimit(mockContext, {
                    endpoint: "session",
                    identifier: clientIp,
                    identifierType: "ip",
                    errorCode: "RATELIMIT_SESSION_EXCEEDED",
                    maxRequests: 3,
                    timeWindow: "60 s"
                })
            }

            await expect(
                enforceRateLimit(mockContext, {
                    endpoint: "session",
                    identifier: clientIp,
                    identifierType: "ip",
                    errorCode: "RATELIMIT_SESSION_EXCEEDED",
                    maxRequests: 3,
                    timeWindow: "60 s"
                })
            ).rejects.toThrow(AppError)
        })

        it("should set correct rate limit headers", { timeout: 10000 }, async () => {
            const mockContext = createMockContext()
            const clientIp = "192.168.1.102"

            await enforceRateLimit(mockContext, {
                endpoint: "session",
                identifier: clientIp,
                identifierType: "ip",
                errorCode: "RATELIMIT_SESSION_EXCEEDED",
                maxRequests: 3,
                timeWindow: "60 s"
            })

            expect(mockContext.header).toHaveBeenCalledWith("X-RateLimit-ip-Remaining", expect.any(String))
            expect(mockContext.header).toHaveBeenCalledWith("X-RateLimit-ip-Limit", "3")
            expect(mockContext.header).toHaveBeenCalledWith("X-RateLimit-ip-Reset", expect.any(String))
        })

        it("should isolate rate limits between different IPs", { timeout: 10000 }, async () => {
            const mockContext1 = createMockContext()
            const mockContext2 = createMockContext()
            const clientIp1 = "192.168.1.103"
            const clientIp2 = "192.168.1.104"

            for (let i = 0; i < 3; i++) {
                await enforceRateLimit(mockContext1, {
                    endpoint: "session",
                    identifier: clientIp1,
                    identifierType: "ip",
                    errorCode: "RATELIMIT_SESSION_EXCEEDED",
                    maxRequests: 3,
                    timeWindow: "60 s"
                })
            }

            await expect(
                enforceRateLimit(mockContext2, {
                    endpoint: "session",
                    identifier: clientIp2,
                    identifierType: "ip",
                    errorCode: "RATELIMIT_SESSION_EXCEEDED",
                    maxRequests: 3,
                    timeWindow: "60 s"
                })
            ).resolves.toBeUndefined()
        })
    })

    describe("User-based rate limiting", () => {
        it("should allow requests within rate limit (2 req / 1 min)", { timeout: 10000 }, async () => {
            const mockContext = createMockContext()
            const userId = "user-123"

            for (let i = 0; i < 2; i++) {
                await enforceRateLimit(mockContext, {
                    endpoint: "session",
                    identifier: userId,
                    identifierType: "user",
                    errorCode: "RATELIMIT_SESSION_EXCEEDED",
                    maxRequests: 2,
                    timeWindow: "60 s"
                })
            }

            expect(mockContext.header).toHaveBeenCalled()
        })

        it("should reject requests exceeding rate limit (3rd request)", { timeout: 10000 }, async () => {
            const mockContext = createMockContext()
            const userId = "user-456"

            for (let i = 0; i < 2; i++) {
                await enforceRateLimit(mockContext, {
                    endpoint: "session",
                    identifier: userId,
                    identifierType: "user",
                    errorCode: "RATELIMIT_SESSION_EXCEEDED",
                    maxRequests: 2,
                    timeWindow: "60 s"
                })
            }

            await expect(
                enforceRateLimit(mockContext, {
                    endpoint: "session",
                    identifier: userId,
                    identifierType: "user",
                    errorCode: "RATELIMIT_SESSION_EXCEEDED",
                    maxRequests: 2,
                    timeWindow: "60 s"
                })
            ).rejects.toThrow(AppError)
        })

        it("should set correct rate limit headers", { timeout: 10000 }, async () => {
            const mockContext = createMockContext()
            const userId = "user-789"

            await enforceRateLimit(mockContext, {
                endpoint: "session",
                identifier: userId,
                identifierType: "user",
                errorCode: "RATELIMIT_SESSION_EXCEEDED",
                maxRequests: 2,
                timeWindow: "60 s"
            })

            expect(mockContext.header).toHaveBeenCalledWith("X-RateLimit-user-Remaining", expect.any(String))
            expect(mockContext.header).toHaveBeenCalledWith("X-RateLimit-user-Limit", "2")
            expect(mockContext.header).toHaveBeenCalledWith("X-RateLimit-user-Reset", expect.any(String))
        })

        it("should isolate rate limits between different users", { timeout: 10000 }, async () => {
            const mockContext1 = createMockContext()
            const mockContext2 = createMockContext()
            const userId1 = "user-abc"
            const userId2 = "user-def"

            for (let i = 0; i < 2; i++) {
                await enforceRateLimit(mockContext1, {
                    endpoint: "session",
                    identifier: userId1,
                    identifierType: "user",
                    errorCode: "RATELIMIT_SESSION_EXCEEDED",
                    maxRequests: 2,
                    timeWindow: "60 s"
                })
            }

            await expect(
                enforceRateLimit(mockContext2, {
                    endpoint: "session",
                    identifier: userId2,
                    identifierType: "user",
                    errorCode: "RATELIMIT_SESSION_EXCEEDED",
                    maxRequests: 2,
                    timeWindow: "60 s"
                })
            ).resolves.toBeUndefined()
        })
    })

    describe("Independent rate limit enforcement", () => {
        it("should enforce IP and user limits independently", { timeout: 10000 }, async () => {
            const mockContext = createMockContext()
            const clientIp = "192.168.1.200"
            const userId = "user-independent"

            for (let i = 0; i < 3; i++) {
                await enforceRateLimit(mockContext, {
                    endpoint: "session",
                    identifier: clientIp,
                    identifierType: "ip",
                    errorCode: "RATELIMIT_SESSION_EXCEEDED",
                    maxRequests: 3,
                    timeWindow: "60 s"
                })
            }

            await expect(
                enforceRateLimit(mockContext, {
                    endpoint: "session",
                    identifier: userId,
                    identifierType: "user",
                    errorCode: "RATELIMIT_SESSION_EXCEEDED",
                    maxRequests: 2,
                    timeWindow: "60 s"
                })
            ).resolves.toBeUndefined()
        })
    })
})

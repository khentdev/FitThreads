import { Context } from "hono"
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest"
import { cleanupTestKeys, getRedisClient } from "../../../configs/redis.js"
import { createApp } from "../../../createApp.js"
import { AppError } from "../../../errors/customError.js"
import { enforceRateLimit } from "../../../lib/rateLimit.js"


describe("Rate Limit For Login Validation Middleware (validateLoginAccount)", () => {
    let app: ReturnType<typeof createApp> | null = null
    let redis: ReturnType<typeof getRedisClient> | null = null

    beforeAll(() => {
        app = createApp()
        redis = getRedisClient()
    })

    beforeEach(async () => {
        cleanupTestKeys()
    })

    afterAll(async () => {
        cleanupTestKeys()
    })

    const createMockContext = (): Context => {
        return {
            header: vi.fn(),
        } as unknown as Context
    }

    describe("IP-based rate limiting", () => {
        it("should allow requests within rate limit (3 req / 15 min)", { timeout: 60000 }, async () => {
            const mockContext = createMockContext()
            const clientIp = "192.168.1.100"

            for (let i = 0; i < 3; i++) {
                await enforceRateLimit(mockContext, {
                    endpoint: "login",
                    identifier: clientIp,
                    identifierType: "ip",
                    errorCode: "AUTH_RATE_LIMIT_LOGIN",
                    maxRequests: 3,
                    timeWindow: "15 m"
                })
            }

            expect(mockContext.header).toHaveBeenCalled()
        })

        it("should reject requests exceeding rate limit (4th request)", { timeout: 60000 }, async () => {
            const mockContext = createMockContext()
            const clientIp = "192.168.1.101"

            for (let i = 0; i < 3; i++) {
                await enforceRateLimit(mockContext, {
                    endpoint: "login",
                    identifier: clientIp,
                    identifierType: "ip",
                    errorCode: "AUTH_RATE_LIMIT_LOGIN",
                    maxRequests: 3,
                    timeWindow: "15 m"
                })
            }

            await expect(
                enforceRateLimit(mockContext, {
                    endpoint: "login",
                    identifier: clientIp,
                    identifierType: "ip",
                    errorCode: "AUTH_RATE_LIMIT_LOGIN",
                    maxRequests: 3,
                    timeWindow: "15 m"
                })
            ).rejects.toThrow(AppError)
        })

        it("should set correct rate limit headers", { timeout: 60000 }, async () => {
            const mockContext = createMockContext()
            const clientIp = "192.168.1.102"

            await enforceRateLimit(mockContext, {
                endpoint: "login",
                identifier: clientIp,
                identifierType: "ip",
                errorCode: "AUTH_RATE_LIMIT_LOGIN",
                maxRequests: 3,
                timeWindow: "15 m"
            })

            expect(mockContext.header).toHaveBeenCalledWith("X-RateLimit-ip-Remaining", expect.any(String))
            expect(mockContext.header).toHaveBeenCalledWith("X-RateLimit-ip-Limit", "3")
            expect(mockContext.header).toHaveBeenCalledWith("X-RateLimit-ip-Reset", expect.any(String))
        })
    })

    describe("Username-based rate limiting", () => {
        it("should allow requests within rate limit (2 req / 1 hr)", { timeout: 60000 }, async () => {
            const mockContext = createMockContext()
            const username = "testuser1"

            for (let i = 0; i < 2; i++) {
                await enforceRateLimit(mockContext, {
                    endpoint: "login",
                    identifier: username,
                    identifierType: "username",
                    errorCode: "AUTH_RATE_LIMIT_LOGIN",
                    maxRequests: 2,
                    timeWindow: "1 h"
                })
            }

            expect(mockContext.header).toHaveBeenCalled()
        })

        it("should reject requests exceeding rate limit (3rd request)", { timeout: 60000 }, async () => {
            const mockContext = createMockContext()
            const username = "testuser2"

            for (let i = 0; i < 2; i++) {
                await enforceRateLimit(mockContext, {
                    endpoint: "login",
                    identifier: username,
                    identifierType: "username",
                    errorCode: "AUTH_RATE_LIMIT_LOGIN",
                    maxRequests: 2,
                    timeWindow: "1 h"
                })
            }

            await expect(
                enforceRateLimit(mockContext, {
                    endpoint: "login",
                    identifier: username,
                    identifierType: "username",
                    errorCode: "AUTH_RATE_LIMIT_LOGIN",
                    maxRequests: 2,
                    timeWindow: "1 h"
                })
            ).rejects.toThrow(AppError)
        })

        it("should isolate rate limits between different usernames", { timeout: 60000 }, async () => {
            const mockContext1 = createMockContext()
            const mockContext2 = createMockContext()
            const username1 = "testuser3"
            const username2 = "testuser4"

            for (let i = 0; i < 2; i++) {
                await enforceRateLimit(mockContext1, {
                    endpoint: "login",
                    identifier: username1,
                    identifierType: "username",
                    errorCode: "AUTH_RATE_LIMIT_LOGIN",
                    maxRequests: 2,
                    timeWindow: "1 h"
                })
            }

            await expect(
                enforceRateLimit(mockContext2, {
                    endpoint: "login",
                    identifier: username2,
                    identifierType: "username",
                    errorCode: "AUTH_RATE_LIMIT_LOGIN",
                    maxRequests: 2,
                    timeWindow: "1 h"
                })
            ).resolves.toBeUndefined()
        })
    })

    describe("Independent rate limit enforcement", () => {
        it("should enforce IP and username limits independently", { timeout: 60000 }, async () => {
            const mockContext = createMockContext()
            const clientIp = "192.168.1.200"
            const username = "independentuser"

            for (let i = 0; i < 3; i++) {
                await enforceRateLimit(mockContext, {
                    endpoint: "login",
                    identifier: clientIp,
                    identifierType: "ip",
                    errorCode: "AUTH_RATE_LIMIT_LOGIN",
                    maxRequests: 3,
                    timeWindow: "15 m"
                })
            }

            await expect(
                enforceRateLimit(mockContext, {
                    endpoint: "login",
                    identifier: username,
                    identifierType: "username",
                    errorCode: "AUTH_RATE_LIMIT_LOGIN",
                    maxRequests: 2,
                    timeWindow: "1 h"
                })
            ).resolves.toBeUndefined()
        })
    })
})

import { Context } from "hono"
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest"
import { cleanupTestKeys, getRedisClient } from "../../../configs/redis.js"
import { createApp } from "../../../createApp.js"
import { AppError } from "../../../errors/customError.js"
import { enforceRateLimit } from "../../../lib/rateLimit.js"
import { env } from "../../../configs/env.js"


describe("Rate Limit For Password Reset Link Middleware (validateSendPasswordResetLink)", () => {
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
        const MAX_REQUESTS = env.RATELIMIT_PASSWORD_RESET_LINK_IP_MAX

        it(`should allow requests within rate limit (${MAX_REQUESTS} req / 1 hr)`, { timeout: 60000 }, async () => {
            const mockContext = createMockContext()
            const clientIp = "192.168.1.100"

            for (let i = 0; i < MAX_REQUESTS; i++) {
                await enforceRateLimit(mockContext, {
                    endpoint: "password-reset-link",
                    identifier: clientIp,
                    identifierType: "ip",
                    errorCode: "AUTH_RATE_LIMIT_PASSWORD_RESET_LINK",
                    maxRequests: MAX_REQUESTS,
                    timeWindow: `${env.RATELIMIT_PASSWORD_RESET_LINK_IP_WINDOW} s`
                })
            }

            expect(mockContext.header).toHaveBeenCalled()
        })

        it("should reject requests exceeding rate limit", { timeout: 60000 }, async () => {
            const mockContext = createMockContext()
            const clientIp = "192.168.1.101"

            for (let i = 0; i < MAX_REQUESTS; i++) {
                await enforceRateLimit(mockContext, {
                    endpoint: "password-reset-link",
                    identifier: clientIp,
                    identifierType: "ip",
                    errorCode: "AUTH_RATE_LIMIT_PASSWORD_RESET_LINK",
                    maxRequests: MAX_REQUESTS,
                    timeWindow: `${env.RATELIMIT_PASSWORD_RESET_LINK_IP_WINDOW} s`
                })
            }

            await expect(
                enforceRateLimit(mockContext, {
                    endpoint: "password-reset-link",
                    identifier: clientIp,
                    identifierType: "ip",
                    errorCode: "AUTH_RATE_LIMIT_PASSWORD_RESET_LINK",
                    maxRequests: MAX_REQUESTS,
                    timeWindow: `${env.RATELIMIT_PASSWORD_RESET_LINK_IP_WINDOW} s`
                })
            ).rejects.toThrow(AppError)
        })

        it("should set correct rate limit headers", { timeout: 60000 }, async () => {
            const mockContext = createMockContext()
            const clientIp = "192.168.1.102"

            await enforceRateLimit(mockContext, {
                endpoint: "password-reset-link",
                identifier: clientIp,
                identifierType: "ip",
                errorCode: "AUTH_RATE_LIMIT_PASSWORD_RESET_LINK",
                maxRequests: MAX_REQUESTS,
                timeWindow: `${env.RATELIMIT_PASSWORD_RESET_LINK_IP_WINDOW} s`
            })

            expect(mockContext.header).toHaveBeenCalledWith("X-RateLimit-ip-Remaining", expect.any(String))
            expect(mockContext.header).toHaveBeenCalledWith("X-RateLimit-ip-Limit", String(MAX_REQUESTS))
            expect(mockContext.header).toHaveBeenCalledWith("X-RateLimit-ip-Reset", expect.any(String))
        })
    })

    describe("email-based rate limiting", () => {
        const MAX_REQUESTS = env.RATELIMIT_PASSWORD_RESET_LINK_EMAIL_MAX


        it(`should allow requests within rate limit (${MAX_REQUESTS} req / 1 hr)`, { timeout: 60000 }, async () => {
            const mockContext = createMockContext()
            const email = "testuser1@example.com"

            for (let i = 0; i < MAX_REQUESTS; i++) {
                await enforceRateLimit(mockContext, {
                    endpoint: "password-reset-link",
                    identifier: email,
                    identifierType: "email",
                    errorCode: "AUTH_RATE_LIMIT_PASSWORD_RESET_LINK",
                    maxRequests: MAX_REQUESTS,
                    timeWindow: `${env.RATELIMIT_PASSWORD_RESET_LINK_IP_WINDOW} s`
                })
            }

            expect(mockContext.header).toHaveBeenCalled()
        })

        it("should reject requests exceeding rate limit", { timeout: 60000 }, async () => {
            const mockContext = createMockContext()
            const email = "testuser2@example.com"

            for (let i = 0; i < MAX_REQUESTS; i++) {
                await enforceRateLimit(mockContext, {
                    endpoint: "password-reset-link",
                    identifier: email,
                    identifierType: "email",
                    errorCode: "AUTH_RATE_LIMIT_PASSWORD_RESET_LINK",
                    maxRequests: MAX_REQUESTS,
                    timeWindow: `${env.RATELIMIT_PASSWORD_RESET_LINK_IP_WINDOW} s`
                })
            }

            await expect(
                enforceRateLimit(mockContext, {
                    endpoint: "password-reset-link",
                    identifier: email,
                    identifierType: "email",
                    errorCode: "AUTH_RATE_LIMIT_PASSWORD_RESET_LINK",
                    maxRequests: MAX_REQUESTS,
                    timeWindow: `${env.RATELIMIT_PASSWORD_RESET_LINK_IP_WINDOW} s`
                })
            ).rejects.toThrow(AppError)
        })

        it("should isolate rate limits between different email", { timeout: 60000 }, async () => {
            const mockContext1 = createMockContext()
            const mockContext2 = createMockContext()
            const email1 = "testuser3@example.com"
            const email2 = "testuser4@example.com"

            for (let i = 0; i < MAX_REQUESTS; i++) {
                await enforceRateLimit(mockContext1, {
                    endpoint: "password-reset-link",
                    identifier: email1,
                    identifierType: "email",
                    errorCode: "AUTH_RATE_LIMIT_PASSWORD_RESET_LINK",
                    maxRequests: MAX_REQUESTS,
                    timeWindow: `${env.RATELIMIT_PASSWORD_RESET_LINK_IP_WINDOW} s`
                })
            }

            await expect(
                enforceRateLimit(mockContext2, {
                    endpoint: "password-reset-link",
                    identifier: email2,
                    identifierType: "email",
                    errorCode: "AUTH_RATE_LIMIT_PASSWORD_RESET_LINK",
                    maxRequests: MAX_REQUESTS,
                    timeWindow: `${env.RATELIMIT_PASSWORD_RESET_LINK_IP_WINDOW} s`
                })
            ).resolves.toBeUndefined()
        })
    })

    describe("Independent rate limit enforcement", () => {
        it("should enforce IP and email limits independently", { timeout: 60000 }, async () => {
            const mockContext = createMockContext()
            const clientIp = "192.168.1.200"
            const email = "email@example.com"

            const IP_MAX = env.RATELIMIT_PASSWORD_RESET_LINK_IP_MAX
            const EMAIL_MAX = env.RATELIMIT_PASSWORD_RESET_LINK_EMAIL_MAX

            for (let i = 0; i < IP_MAX; i++) {
                await enforceRateLimit(mockContext, {
                    endpoint: "password-reset-link",
                    identifier: clientIp,
                    identifierType: "ip",
                    errorCode: "AUTH_RATE_LIMIT_PASSWORD_RESET_LINK",
                    maxRequests: IP_MAX,
                    timeWindow: `${env.RATELIMIT_PASSWORD_RESET_LINK_IP_WINDOW} s`
                })
            }

            await expect(
                enforceRateLimit(mockContext, {
                    endpoint: "password-reset-link",
                    identifier: email,
                    identifierType: "email",
                    errorCode: "AUTH_RATE_LIMIT_PASSWORD_RESET_LINK",
                    maxRequests: EMAIL_MAX,
                    timeWindow: `${env.RATELIMIT_PASSWORD_RESET_LINK_EMAIL_WINDOW} s`
                })
            ).resolves.toBeUndefined()
        })
    })
})

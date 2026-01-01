import { Context } from "hono"
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest"
import { getRedisClient } from "../../../configs/redis.js"
import { createApp } from "../../../createApp.js"
import { AppError } from "../../../errors/customError.js"
import { enforceRateLimit } from "../../../lib/rateLimit.js"


describe("Rate Limit For Resend OTP Middleware (validateResendOTP)", () => {
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
        it("should allow requests within rate limit (3 req / 1 hour)", { timeout: 60000 }, async () => {
            const mockContext = createMockContext()
            const clientIp = "192.168.1.100"

            for (let i = 0; i < 3; i++) {
                await enforceRateLimit(mockContext, {
                    endpoint: "verify/resend-otp",
                    identifier: clientIp,
                    identifierType: "ip",
                    errorCode: "AUTH_RATE_LIMIT_RESEND_OTP",
                    maxRequests: 3,
                    timeWindow: "1 h"
                })
            }

            expect(mockContext.header).toHaveBeenCalled()
        })

        it("should reject requests exceeding rate limit (4th request)", { timeout: 60000 }, async () => {
            const mockContext = createMockContext()
            const clientIp = "192.168.1.101"

            for (let i = 0; i < 3; i++) {
                await enforceRateLimit(mockContext, {
                    endpoint: "verify/resend-otp",
                    identifier: clientIp,
                    identifierType: "ip",
                    errorCode: "AUTH_RATE_LIMIT_RESEND_OTP",
                    maxRequests: 3,
                    timeWindow: "1 h"
                })
            }

            await expect(
                enforceRateLimit(mockContext, {
                    endpoint: "verify/resend-otp",
                    identifier: clientIp,
                    identifierType: "ip",
                    errorCode: "AUTH_RATE_LIMIT_RESEND_OTP",
                    maxRequests: 3,
                    timeWindow: "1 h"
                })
            ).rejects.toThrow(AppError)
        })

        it("should set correct rate limit headers", { timeout: 60000 }, async () => {
            const mockContext = createMockContext()
            const clientIp = "192.168.1.102"

            await enforceRateLimit(mockContext, {
                endpoint: "verify/resend-otp",
                identifier: clientIp,
                identifierType: "ip",
                errorCode: "AUTH_RATE_LIMIT_RESEND_OTP",
                maxRequests: 3,
                timeWindow: "1 h"
            })

            expect(mockContext.header).toHaveBeenCalledWith("X-RateLimit-ip-Remaining", expect.any(String))
            expect(mockContext.header).toHaveBeenCalledWith("X-RateLimit-ip-Limit", "3")
            expect(mockContext.header).toHaveBeenCalledWith("X-RateLimit-ip-Reset", expect.any(String))
        })
    })

    describe("email-based rate limiting", () => {
        it("should allow requests within rate limit (2 req / 1 hr)", { timeout: 60000 }, async () => {
            const mockContext = createMockContext()
            const email = "testuser1@example.com"

            for (let i = 0; i < 2; i++) {
                await enforceRateLimit(mockContext, {
                    endpoint: "verify/resend-otp",
                    identifier: email,
                    identifierType: "email",
                    errorCode: "AUTH_RATE_LIMIT_RESEND_OTP",
                    maxRequests: 2,
                    timeWindow: "1 h"
                })
            }

            expect(mockContext.header).toHaveBeenCalled()
        })

        it("should reject requests exceeding rate limit (3rd request)", { timeout: 60000 }, async () => {
            const mockContext = createMockContext()
            const email = "testuser2@example.com"

            for (let i = 0; i < 2; i++) {
                await enforceRateLimit(mockContext, {
                    endpoint: "verify/resend-otp",
                    identifier: email,
                    identifierType: "email",
                    errorCode: "AUTH_RATE_LIMIT_RESEND_OTP",
                    maxRequests: 2,
                    timeWindow: "1 h"
                })
            }

            await expect(
                enforceRateLimit(mockContext, {
                    endpoint: "verify/resend-otp",
                    identifier: email,
                    identifierType: "email",
                    errorCode: "AUTH_RATE_LIMIT_RESEND_OTP",
                    maxRequests: 2,
                    timeWindow: "1 h"
                })
            ).rejects.toThrow(AppError)
        })

        it("should isolate rate limits between different emails", { timeout: 60000 }, async () => {
            const mockContext1 = createMockContext()
            const mockContext2 = createMockContext()
            const email1 = "testuser3@example.com"
            const email2 = "testuser4@example.com"

            for (let i = 0; i < 2; i++) {
                await enforceRateLimit(mockContext1, {
                    endpoint: "verify/resend-otp",
                    identifier: email1,
                    identifierType: "email",
                    errorCode: "AUTH_RATE_LIMIT_RESEND_OTP",
                    maxRequests: 2,
                    timeWindow: "1 h"
                })
            }

            await expect(
                enforceRateLimit(mockContext2, {
                    endpoint: "verify/resend-otp",
                    identifier: email2,
                    identifierType: "email",
                    errorCode: "AUTH_RATE_LIMIT_RESEND_OTP",
                    maxRequests: 2,
                    timeWindow: "1 h"
                })
            ).resolves.toBeUndefined()
        })
    })

    describe("Independent rate limit enforcement", () => {
        it("should enforce IP and email limits independently", { timeout: 60000 }, async () => {
            const mockContext = createMockContext()
            const clientIp = "192.168.1.200"
            const email = "independentuser@example.com"

            for (let i = 0; i < 3; i++) {
                await enforceRateLimit(mockContext, {
                    endpoint: "verify/resend-otp",
                    identifier: clientIp,
                    identifierType: "ip",
                    errorCode: "AUTH_RATE_LIMIT_RESEND_OTP",
                    maxRequests: 3,
                    timeWindow: "1 h"
                })
            }

            await expect(
                enforceRateLimit(mockContext, {
                    endpoint: "verify/resend-otp",
                    identifier: email,
                    identifierType: "email",
                    errorCode: "AUTH_RATE_LIMIT_RESEND_OTP",
                    maxRequests: 2,
                    timeWindow: "1 h"
                })
            ).resolves.toBeUndefined()
        })
    })
})

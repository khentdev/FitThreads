import { Context } from "hono"
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest"
import { cleanupTestKeys, getRedisClient } from "../../../configs/redis.js"
import { createApp } from "../../../createApp.js"
import { AppError } from "../../../errors/customError.js"
import { enforceRateLimit } from "../../../lib/rateLimit.js"


describe("Rate Limit For Signup Validation Middleware (validateVerifyOTPAndCreateAccount)", () => {
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
        it("should allow requests within rate limit (2 req / 10 m)", { timeout: 60000 }, async () => {
            const mockContext = createMockContext()
            const clientIp = "192.168.1.100"

            for (let i = 0; i < 2; i++) {
                await enforceRateLimit(mockContext, {
                    endpoint: "signup/verify-otp",
                    identifier: clientIp,
                    identifierType: "ip",
                    errorCode: "AUTH_RATE_LIMIT_SIGNUP_VERIFY_OTP",
                    maxRequests: 2,
                    timeWindow: "10 m"
                })
            }

            expect(mockContext.header).toHaveBeenCalled()
        })

        it("should reject requests exceeding rate limit (3rd request)", { timeout: 60000 }, async () => {
            const mockContext = createMockContext()
            const clientIp = "192.168.1.101"

            for (let i = 0; i < 2; i++) {
                await enforceRateLimit(mockContext, {
                    endpoint: "signup/verify-otp",
                    identifier: clientIp,
                    identifierType: "ip",
                    errorCode: "AUTH_RATE_LIMIT_SIGNUP_VERIFY_OTP",
                    maxRequests: 2,
                    timeWindow: "10 m"
                })
            }

            await expect(
                enforceRateLimit(mockContext, {
                    endpoint: "signup/verify-otp",
                    identifier: clientIp,
                    identifierType: "ip",
                    errorCode: "AUTH_RATE_LIMIT_SIGNUP_VERIFY_OTP",
                    maxRequests: 2,
                    timeWindow: "10 m"
                })
            ).rejects.toThrow(AppError)
        })

        it("should set correct rate limit headers", { timeout: 60000 }, async () => {
            const mockContext = createMockContext()
            const clientIp = "192.168.1.102"

            await enforceRateLimit(mockContext, {
                endpoint: "signup/verify-otp",
                identifier: clientIp,
                identifierType: "ip",
                errorCode: "AUTH_RATE_LIMIT_SIGNUP_VERIFY_OTP",
                maxRequests: 2,
                timeWindow: "10 m"
            })

            expect(mockContext.header).toHaveBeenCalledWith("X-RateLimit-ip-Remaining", expect.any(String))
            expect(mockContext.header).toHaveBeenCalledWith("X-RateLimit-ip-Limit", "2")
            expect(mockContext.header).toHaveBeenCalledWith("X-RateLimit-ip-Reset", expect.any(String))
        })
    })
})

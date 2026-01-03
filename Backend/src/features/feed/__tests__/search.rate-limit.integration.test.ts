import { Context, Next } from "hono"
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest"
import { cleanupTestKeys, getRedisClient } from "../../../configs/redis.js"
import { createApp } from "../../../createApp.js"
import { AppError } from "../../../errors/customError.js"
import { rateLimitSearch } from "../middlewares.js"

vi.mock("../../../configs/env.js", async (importOriginal) => {
    const actual = await importOriginal<typeof import("../../../configs/env.js")>()
    return {
        ...actual,
        env: {
            ...actual.env,
            RATELIMIT_SEARCH_IP_MAX: 2,
            RATELIMIT_SEARCH_IP_WINDOW: 60,
            RATELIMIT_SEARCH_USER_MAX: 3,
            RATELIMIT_SEARCH_USER_WINDOW: 60,
            RATELIMIT_SEARCH_AUTHENTICATED_IP_MAX: 4,
            RATELIMIT_SEARCH_AUTHENTICATED_IP_WINDOW: 60,
        }
    }
})

describe("Rate Limit For Search", () => {
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

    const createMockContext = (ip: string, user?: { id: string }): Context => {
        return {
            req: {
                header: (name: string) => {
                    if (name === "x-forwarded-for") return ip
                    return undefined
                }
            },
            header: vi.fn(),
            get: (key: string) => {
                if (key === "verifyTokenVariables") {
                    return { user }
                }
                return undefined
            }
        } as unknown as Context
    }

    const next: Next = vi.fn()

    describe("Unauthenticated (IP only)", () => {
        it("should allow requests within rate limit (2 req / 1 min)", { timeout: 10000 }, async () => {
            const ip = "10.0.0.1"
            const ctx = createMockContext(ip)

            for (let i = 0; i < 2; i++) {
                await rateLimitSearch(ctx, next)
            }
            expect(next).toHaveBeenCalledTimes(2)
        })

        it("should reject requests exceeding rate limit (3rd request)", { timeout: 10000 }, async () => {
            const ip = "10.0.0.2"
            const ctx = createMockContext(ip)

            for (let i = 0; i < 2; i++) {
                await rateLimitSearch(ctx, next)
            }

            await expect(rateLimitSearch(ctx, next)).rejects.toThrow(AppError)
        })
    })

    describe("Authenticated (User + IP)", () => {
        it("should allow requests within user rate limit (3 req / 1 min)", { timeout: 10000 }, async () => {
            const ip = "10.0.0.3"
            const user = { id: "user1" }
            const ctx = createMockContext(ip, user)

            vi.mocked(next).mockClear()

            for (let i = 0; i < 3; i++) {
                await rateLimitSearch(ctx, next)
            }
            expect(next).toHaveBeenCalledTimes(3)
        })

        it("should reject requests exceeding user rate limit (4th request)", { timeout: 10000 }, async () => {
            const ip = "10.0.0.4"
            const user = { id: "user2" }
            const ctx = createMockContext(ip, user)

            for (let i = 0; i < 3; i++) {
                await rateLimitSearch(ctx, next)
            }

            await expect(rateLimitSearch(ctx, next)).rejects.toThrow(AppError)
        })

        it("should reject requests exceeding authenticated IP rate limit (5th request)", { timeout: 10000 }, async () => {
            const ip = "10.0.0.5"
            const user1 = { id: "user3" }
            const user2 = { id: "user4" }

            const ctx1 = createMockContext(ip, user1)
            const ctx2 = createMockContext(ip, user2)

            for (let i = 0; i < 2; i++) {
                await rateLimitSearch(ctx1, next)
            }

            for (let i = 0; i < 2; i++) {
                await rateLimitSearch(ctx2, next)
            }

            await expect(rateLimitSearch(ctx1, next)).rejects.toThrow(AppError)
        })
    })

    describe("Independence", () => {
        it("should not block authenticated user if unauthenticated IP limit is reached (different keys)", { timeout: 10000 }, async () => {
            const ip = "10.0.0.6"
            const ctxUnauth = createMockContext(ip)
            const ctxAuth = createMockContext(ip, { id: "user5" })

            for (let i = 0; i < 2; i++) {
                await rateLimitSearch(ctxUnauth, next)
            }
            await expect(rateLimitSearch(ctxUnauth, next)).rejects.toThrow(AppError)
            await expect(rateLimitSearch(ctxAuth, next)).resolves.toBeUndefined()
        })
    })
})

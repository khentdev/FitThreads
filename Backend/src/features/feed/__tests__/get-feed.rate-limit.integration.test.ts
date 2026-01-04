import { Context, Next } from "hono"
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest"
import { cleanupTestKeys, getRedisClient } from "../../../configs/redis.js"
import { createApp } from "../../../createApp.js"
import { AppError } from "../../../errors/customError.js"
import { rateLimitGetFeed } from "../middlewares.js"

vi.mock("../../../configs/env.js", async (importOriginal) => {
    const actual = await importOriginal<typeof import("../../../configs/env.js")>()
    return {
        ...actual,
        env: {
            ...actual.env,
            RATELIMIT_GET_FEED_IP_MAX: 2,
            RATELIMIT_GET_FEED_IP_WINDOW: 60,
        }
    }
})

describe("Rate Limit For Get Feed", () => {
    let app: ReturnType<typeof createApp> | null = null
    let redis: ReturnType<typeof getRedisClient> | null = null

    beforeAll(() => {
        app = createApp()
        redis = getRedisClient()
    })

    beforeEach(async () => {
        await cleanupTestKeys()
        vi.mocked(next).mockClear()
    })

    afterAll(async () => {
        await cleanupTestKeys()
    })

    const createMockContext = (ip: string, queryParams: Record<string, string> = {}): Context => {
        return {
            req: {
                header: (name: string) => {
                    if (name === "x-forwarded-for") return ip
                    return undefined
                },
                query: (name: string) => {
                    return queryParams[name]
                }
            },
            header: vi.fn(),
        } as unknown as Context
    }

    const next: Next = vi.fn()

    describe("Unauthenticated (IP only)", () => {
        it("should allow requests within rate limit (2 req / 1 min)", { timeout: 10000 }, async () => {
            const ip = "10.0.0.1"
            const ctx = createMockContext(ip)

            for (let i = 0; i < 2; i++) {
                await rateLimitGetFeed(ctx, next)
            }
            expect(next).toHaveBeenCalledTimes(2)
        })

        it("should reject requests exceeding rate limit (3rd request)", { timeout: 10000 }, async () => {
            const ip = "10.0.0.2"
            const ctx = createMockContext(ip)

            for (let i = 0; i < 2; i++) {
                await rateLimitGetFeed(ctx, next)
            }

            await expect(rateLimitGetFeed(ctx, next)).rejects.toThrow(AppError)
        })
    })

    describe("Bypass Conditions", () => {
        it("should NOT rate limit if username is present", { timeout: 10000 }, async () => {
            const ip = "10.0.0.3"
            const ctx = createMockContext(ip, { username: "someuser" })

            for (let i = 0; i < 10; i++) {
                await rateLimitGetFeed(ctx, next)
            }
            expect(next).toHaveBeenCalledTimes(10)
        })

        it("should NOT rate limit if search is present", { timeout: 10000 }, async () => {
            const ip = "10.0.0.4"
            const ctx = createMockContext(ip, { search: "someterm" })

            for (let i = 0; i < 10; i++) {
                await rateLimitGetFeed(ctx, next)
            }
            expect(next).toHaveBeenCalledTimes(10)
        })
    })
})

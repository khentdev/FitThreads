import { Context, Next } from "hono"
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest"
import { cleanupTestKeys, getRedisClient } from "../../../configs/redis.js"
import { createApp } from "../../../createApp.js"
import { AppError } from "../../../errors/customError.js"
import { rateLimitGetFavoritePosts, } from "../middlewares.js"

vi.mock("../../../configs/env.js", async (importOriginal) => {
    const actual = await importOriginal<typeof import("../../../configs/env.js")>()
    return {
        ...actual,
        env: {
            ...actual.env,
            RATELIMIT_GET_PROFILE_FAVORITES_IP_MAX: 3,
            RATELIMIT_GET_PROFILE_FAVORITES_IP_WINDOW: 60,
        }
    }
})

describe("Get Favorite Posts Rate Limit Integration Tests", () => {
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

    it("should allow requests within rate limit (3 req / 1 m)", async () => {
        const ip = "127.0.0.1"
        const ctx = createMockContext(ip, { username: "testuser" })

        for (let i = 0; i < 3; i++) {
            await rateLimitGetFavoritePosts(ctx, next)
        }
        expect(next).toHaveBeenCalledTimes(3)
    })

    it("should reject requests exceeding rate limit (4th request)", { timeout: 10000 }, async () => {
        const ip = "127.0.0.2"
        const ctx = createMockContext(ip, { username: "testuser" })

        for (let i = 0; i < 3; i++) {
            await rateLimitGetFavoritePosts(ctx, next)
        }

        await expect(rateLimitGetFavoritePosts(ctx, next)).rejects.toThrow(AppError)
    })

    it("should NOT rate limit if username is missing", { timeout: 10000 }, async () => {
        const ip = "127.0.0.3"
        const ctx = createMockContext(ip, {})

        for (let i = 0; i < 10; i++) {
            await rateLimitGetFavoritePosts(ctx, next)
        }
        expect(next).toHaveBeenCalledTimes(10)
    })
})
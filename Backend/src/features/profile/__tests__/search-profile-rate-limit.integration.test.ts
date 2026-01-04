import { Context, Next } from "hono"
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest"
import { cleanupTestKeys, getRedisClient } from "../../../configs/redis.js"
import { createApp } from "../../../createApp.js"
import { AppError } from "../../../errors/customError.js"
import { rateLimitProfileSearch } from "../middlewares.js"

vi.mock("../../../configs/env.js", async (importOriginal) => {
    const actual = await importOriginal<typeof import("../../../configs/env.js")>()
    return {
        ...actual,
        env: {
            ...actual.env,
            RATELIMIT_PROFILE_SEARCH_IP_MAX: 2,
            RATELIMIT_PROFILE_SEARCH_IP_WINDOW: 60,
        }
    }
})

describe("Rate Limit For Profile Search", () => {
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

    const createMockContext = (ip: string, searchQuery: string = "test"): Context => {
        return {
            req: {
                header: (name: string) => {
                    if (name === "x-forwarded-for") return ip
                    return undefined
                },
                query: (name: string) => {
                    if (name === "searchQuery") return searchQuery
                    return undefined
                }
            },
            header: vi.fn(),
        } as unknown as Context
    }

    const next: Next = vi.fn()

    describe("IP Only Rate Limit", () => {
        it("should allow requests within rate limit (2 req / 1 min)", { timeout: 10000 }, async () => {
            const ip = "10.0.0.1"
            const ctx = createMockContext(ip)

            for (let i = 0; i < 2; i++) {
                await rateLimitProfileSearch(ctx, next)
            }
            expect(next).toHaveBeenCalledTimes(2)
        })

        it("should reject requests exceeding rate limit (3rd request)", { timeout: 10000 }, async () => {
            const ip = "10.0.0.2"
            const ctx = createMockContext(ip)

            for (let i = 0; i < 2; i++) {
                await rateLimitProfileSearch(ctx, next)
            }

            await expect(rateLimitProfileSearch(ctx, next)).rejects.toThrow(AppError)
        })
    })
    describe("No Search Query", () => {
        it("should NOT rate limit if search query is missing", { timeout: 10000 }, async () => {
            const ip = "10.0.0.7"
            const ctx = createMockContext(ip, "")

            for (let i = 0; i < 10; i++) {
                await rateLimitProfileSearch(ctx, next)
            }
            expect(next).toHaveBeenCalledTimes(10)
        })
    })

})

import { describe, it, expect, beforeEach, afterAll } from "vitest"
import { createApp } from "../../../createApp.js"
import { getRedisClient } from "../../../configs/redis.js"
import { prisma } from "../../../../prisma/prismaConfig.js"
import { RedisKeys } from "../../../lib/redis-keys.js"
import { randomUUID } from "crypto"

describe("Verify Magic Link Integration Tests", () => {
    const app = createApp()
    const redis = getRedisClient()

    const testUser = {
        email: "testverify@gmail.com",
        username: "testVerifyUser",
        password: "password123"
    }
    const deviceId = {
        userAgent: "test_browser",
        platform: "test_platform",
    }

    beforeEach(async () => {
        await prisma.user.deleteMany({
            where: { email: testUser.email }
        })
        const keys = await redis.keys("otp:magic-link:*")
        if (keys.length > 0) await redis.del(...keys)
    })

    afterAll(async () => {
        await prisma.user.deleteMany({
            where: { email: testUser.email }
        })
        await prisma.$disconnect()
    })

    it("Should verify magic link and login user", async () => {
        await prisma.user.create({
            data: {
                email: testUser.email,
                username: testUser.username,
                hashedPassword: "hashedPassword",
                emailVerified: true
            }
        })

        const token = randomUUID().replace(/-/g, "").slice(0, 32)
        const redisKey = RedisKeys.magicLink(token)
        await redis.setex(redisKey, 600, testUser.email)

        const response = await app.request("/auth/magic-link/verify", {
            method: "POST",
            body: JSON.stringify({ token }),
            headers: {
                "Content-Type": "application/json",
                "X-Fingerprint": JSON.stringify(deviceId)
            }
        })

        expect(response.status).toBe(200)
        const json = await response.json() as any
        expect(json.message).toBe("Welcome back!")
        expect(json.accessToken).toBeDefined()
        expect(json.user.email).toBe(testUser.email)

        const cookies = response.headers.get("set-cookie")
        expect(cookies).toContain("sid=")
        expect(cookies).toContain("csrfToken=")
        const storedEmail = await redis.get(redisKey)
        expect(storedEmail).toBeNull()
    })

    it("Should return 401 for invalid or expired token", async () => {
        const response = await app.request("/auth/magic-link/verify", {
            method: "POST",
            body: JSON.stringify({ token: "invalid-token" }),
            headers: {
                "Content-Type": "application/json",
                "X-Fingerprint": JSON.stringify(deviceId)
            }
        })

        expect(response.status).toBe(401)
        const json = await response.json() as any
        expect(json.error.code).toBe("AUTH_MAGIC_LINK_INVALID_OR_EXPIRED")
    })

    it("Should return 401 if token is missing", async () => {
        const response = await app.request("/auth/magic-link/verify", {
            method: "POST",
            body: JSON.stringify({}),
            headers: {
                "Content-Type": "application/json",
                "X-Fingerprint": JSON.stringify(deviceId)
            }
        })

        expect(response.status).toBe(401)
        const json = await response.json() as any
        expect(json.error.code).toBe("AUTH_MAGIC_LINK_INVALID_OR_EXPIRED")
    })
})

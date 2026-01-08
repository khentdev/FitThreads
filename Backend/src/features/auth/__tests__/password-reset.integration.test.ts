import { vi, describe, it, expect, beforeEach, afterAll } from "vitest"
import { createApp } from "../../../createApp.js"
import { getRedisClient } from "../../../configs/redis.js"
import { prisma } from "../../../../prisma/prismaConfig.js"
import * as resend from "../../../configs/resend.js"
vi.mock("../../../configs/resend.js")

const sendEmailMocked = vi.mocked(resend.sendEmail)
sendEmailMocked.mockResolvedValue({ success: true, messageId: "test-message-id" })


describe("Send Password Reset Link Integration Tests", () => {
    const app = createApp()
    const redis = getRedisClient()

    const testUser = {
        email: "testemail123@gmail.com"
    }
    const deviceId = {
        userAgent: "test_browser",
        platform: "test_platform"
    }

    beforeEach(async () => {
        await prisma.user.deleteMany({
            where: { email: testUser.email }
        })
        const keys = await redis.keys("otp:password-reset:*")
        if (keys.length > 0) await redis.del(...keys)

        const keys2 = await redis.keys("otp:signup:*")
        if (keys2.length > 0) await redis.del(...keys2)
    })

    afterAll(async () => {
        await prisma.user.deleteMany({
            where: { email: testUser.email }
        })
        await prisma.$disconnect()
    })


    it("Should send password reset link on verified user", async () => {
        await prisma.user.create({
            data: {
                email: testUser.email,
                username: "testUsername123",
                hashedPassword: "testPassword123",
                emailVerified: true
            }
        })
        const response = await app.request("/auth/password", {
            method: "POST",
            body: JSON.stringify({ email: testUser.email }),
            headers: {
                "Content-Type": "application/json",
                "X-Fingerprint": JSON.stringify(deviceId)
            }
        })
        expect(response.status).toBe(200)
        const json = await response.json() as { email: string, message: string }
        expect(json.email).toEqual(testUser.email)
        expect(json.message).toEqual("Password reset link sent - check your inbox.")

        const otpKeys = await redis.keys("otp:password-reset:*")
        expect(otpKeys.length).toBe(1)
        const otp = otpKeys[0].replace("otp:password-reset:", "")
        expect(otp).toBeDefined()
    })

    it("Should return status: 200 on non-existing user for security (to eliminate email enumeration attacks)", async () => {
        const response = await app.request("/auth/password", {
            method: "POST",
            body: JSON.stringify({ email: testUser.email }),
            headers: {
                "Content-Type": "application/json",
                "X-Fingerprint": JSON.stringify(deviceId)
            }
        })
        expect(response.status).toBe(200)
        const json = await response.json() as { email: string, message: string }
        expect(json.email).toEqual(testUser.email)
        expect(json.message).toEqual("Password reset link sent - check your inbox.")

        const otpKeys = await redis.keys("otp:password-reset:*")
        expect(otpKeys.length).toBe(0)
    })

    it("Should send OTP on unverified account", async () => {
        await prisma.user.create({
            data: {
                email: testUser.email,
                username: "testUsername123",
                hashedPassword: "testPassword123",
                emailVerified: false
            }
        })
        const response = await app.request("/auth/password", {
            method: "POST",
            body: JSON.stringify({ email: testUser.email }),
            headers: {
                "Content-Type": "application/json",
                "X-Fingerprint": JSON.stringify(deviceId)
            }
        })
        expect(response.status).toBe(403)
        const json = await response.json() as { error: { code: string, message: string } }
        expect(json.error.code).toBe("AUTH_USER_NOT_VERIFIED")
        expect(json.error.message).toBe("Please verify your email before logging in. We've sent a new verification code.")

        const otpKeys = await redis.keys("otp:signup:*")
        expect(otpKeys.length).toBe(1)
        const otp = otpKeys[0].replace("otp:signup:", "")
        expect(otp).toBeDefined()
    })
})
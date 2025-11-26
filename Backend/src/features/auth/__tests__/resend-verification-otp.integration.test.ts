import { vi, describe, beforeEach, expect, it, afterAll } from "vitest"
import { prisma } from "../../../../prisma/prismaConfig.js"
import { createApp } from "../../../createApp.js"
import { getRedisClient } from "../../../configs/redis.js"

vi.mock("../../../configs/resend.js", () => ({
    sendEmail: vi.fn().mockResolvedValue({ success: true, messageId: "testMessageId" })
}))

describe("Resend Verification OTP Tests", () => {
    const app = createApp()
    const redis = getRedisClient()

    const testUser = {
        username: "testuser",
        email: "testuser@example.com",
        password: "testpassword"
    }

    beforeEach(async () => {
        console.log("Cleaning dummy account before tests...")
        await prisma.user.deleteMany({
            where: { email: testUser.email }
        })
        console.log("Cleaning OTP keys before tests...")
        const otpKeys = await redis.keys("otp:signup:*")
        if (otpKeys.length > 0) await redis.del(...otpKeys)
        console.log("Cleanup complete.")
    })

    afterAll(async () => {
        console.log("Final cleanup...");
        await prisma.user.deleteMany({
            where: { email: testUser.email }
        });
        await prisma.$disconnect();
        console.log("All done!");
    })

    let validOTP: string | null;
    it("Should resend OTP to unverified user email", async () => {
        await prisma.user.create({
            data: {
                username: testUser.username,
                email: testUser.email,
                hashedPassword: testUser.password,
                emailVerified: false
            }
        })

        const response = await app.request("/auth/verify/resend-otp", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: testUser.email
            })
        })

        console.log("Response status:", response.status)
        const json = await response.json() as any
        console.log("Response body:", json)

        expect(response.status).toBe(200)
        expect(json.message).toBe("Verification code sent to your email. Please check your inbox.")

        const otpKeys = await redis.keys("otp:signup:*")
        expect(otpKeys.length).toBe(1)
        validOTP = otpKeys[0].replace("otp:signup:", "")
        expect(validOTP).toBeDefined()
        console.log("Valid OTP:", validOTP)
    })

    it('should throw AUTH_USER_NOT_FOUND if email does not exist', async () => {
        const response = await app.request("/auth/verify/resend-otp", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: "nonexistentuser@example.com"
            })
        })

        console.log("Response status:", response.status)
        const json = await response.json() as any
        console.log("Response body:", json)

        expect(response.status).toBe(404)
        expect(json.error.code).toBe("AUTH_USER_NOT_FOUND")
        expect(json.error.message).toBe("We couldn't find an account with those credentials.")
    })

    it('should throw AUTH_USER_ALREADY_VERIFIED if user is already verified', async () => {
        await prisma.user.create({
            data: {
                username: testUser.username,
                email: testUser.email,
                hashedPassword: testUser.password,
                emailVerified: true
            }
        })

        const response = await app.request("/auth/verify/resend-otp", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: testUser.email
            })
        })

        console.log("Response status:", response.status)
        const json = await response.json() as any
        console.log("Response body:", json)

        expect(response.status).toBe(409)
        expect(json.error.code).toBe("AUTH_USER_ALREADY_VERIFIED")
        expect(json.error.message).toBe("Your account is already verified. You can log in now.")
    })

    it('should store new OTP in Redis and send email', async () => {

        await prisma.user.create({
            data: {
                username: testUser.username,
                email: testUser.email,
                hashedPassword: testUser.password,
                emailVerified: false
            }
        })

        const response = await app.request("/auth/verify/resend-otp", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: testUser.email
            })
        })

        console.log("Response status:", response.status)
        const json = await response.json() as any
        console.log("Response body:", json)

        expect(response.status).toBe(200)
        expect(json.message).toBe("Verification code sent to your email. Please check your inbox.")

        const otpKeys = await redis.keys("otp:signup:*")
        expect(otpKeys.length).toBe(1)
        const otp = otpKeys[0].replace("otp:signup:", "")
        expect(otp).toBeDefined()
        console.log("New OTP Stored in Redis:", otp)
    })

})
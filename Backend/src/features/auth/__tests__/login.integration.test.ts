import { vi, describe, it, expect, beforeEach, afterAll } from "vitest";
import { createApp } from "../../../createApp.js";
import { prisma } from "../../../../prisma/prismaConfig.js";
import { getRedisClient } from "../../../configs/redis.js";
import bcrypt from "bcrypt";

vi.mock("../../../configs/resend.js", () => ({
    sendEmail: vi.fn().mockResolvedValue({ success: true, messageId: "Message test id 123" })
}));

describe("Login Integration Tests", () => {
    const app = createApp()
    const redis = getRedisClient()

    const testUser = {
        username: "login_test_user",
        email: "logintest@example.com",
        password: "password123"
    }

    const testDeviceId = JSON.stringify({
        userAgent: "test_browser",
        platform: "test_platform",
    })

    beforeEach(async () => {
        await prisma.user.deleteMany({
            where: { email: testUser.email }
        })
        const otpKeys = await redis.keys("otp:signup:*")
        if (otpKeys.length > 0) await redis.del(...otpKeys)
    })

    afterAll(async () => {
        await prisma.user.deleteMany({
            where: { email: testUser.email }
        });
        await prisma.$disconnect();
    })

    describe("POST /auth/login", () => {
        it("Should login successfully with valid credentials and verified account", async () => {
            const hashedPassword = await bcrypt.hash(testUser.password, 10);
            await prisma.user.create({
                data: {
                    username: testUser.username,
                    email: testUser.email,
                    hashedPassword,
                    emailVerified: true,
                    emailVerifiedAt: new Date()
                }
            });

            const response = await app.request("/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Fingerprint": testDeviceId
                },
                body: JSON.stringify(testUser),
            })

            expect(response.status).toBe(200)
            const json = await response.json() as any
            expect(json.message).toBe("Welcome back!")
            expect(json.accessToken).toBeTruthy()
            expect(json.user.emailVerified).toBe(true)
        })

        it("Should reject unverified user, send OTP, and return 403", async () => {

            const hashedPassword = await bcrypt.hash(testUser.password, 10);
            const user = await prisma.user.create({
                data: {
                    username: testUser.username,
                    email: testUser.email,
                    hashedPassword,
                    emailVerified: false
                }
            });

            const response = await app.request("/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Fingerprint": testDeviceId
                },
                body: JSON.stringify(testUser),
            })

            expect(response.status).toBe(403)
            const json = await response.json() as any
            expect(json.error.code).toBe("AUTH_USER_NOT_VERIFIED")
            expect(json.error.message).toBe("Please verify your email before logging in. We've sent a new verification code.")


            const otpKeys = await redis.keys("otp:signup:*")
            expect(otpKeys.length).toBe(1)

            const storedUserId = await redis.get(otpKeys[0])
            expect(storedUserId).toBe(user.id)
        })

        it("Should reject invalid password", async () => {

            const hashedPassword = await bcrypt.hash(testUser.password, 10);
            await prisma.user.create({
                data: {
                    username: testUser.username,
                    email: testUser.email,
                    hashedPassword,
                    emailVerified: true
                }
            });

            const response = await app.request("/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Fingerprint": testDeviceId
                },
                body: JSON.stringify({
                    username: testUser.username,
                    password: "wrongpassword",
                }),
            })

            expect(response.status).toBe(401)
            const json = await response.json() as any
            expect(json.error.code).toBe("AUTH_INVALID_CREDENTIALS")
        })

        it("Should reject non-existent user", async () => {
            const response = await app.request("/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Fingerprint": testDeviceId
                },
                body: JSON.stringify({
                    username: "nonexistent",
                    password: "password123",
                }),
            })

            expect(response.status).toBe(401)
            const json = await response.json() as any
            expect(json.error.code).toBe("AUTH_INVALID_CREDENTIALS")
        })
    })
})
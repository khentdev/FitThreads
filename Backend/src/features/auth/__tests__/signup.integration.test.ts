import { vi, describe, it, expect, beforeEach, afterAll } from "vitest";
import { createApp } from "../../../createApp.js";
import { prisma } from "../../../../prisma/prismaConfig.js";
import { getRedisClient } from "../../../configs/redis.js";
import { RedisKeys } from "../../../lib/redis-keys.js";

vi.mock("../../../configs/resend.js", () => ({
    sendEmail: vi.fn().mockResolvedValue({ success: true, messageId: "Message test id 123" })
}));

describe("Signup Integration Tests", () => {
    const app = createApp()
    const redis = getRedisClient()

    const testUser = {
        username: "test_user19",
        email: "testuser19@example.com",
        password: "password123"
    }

    const testDeviceId = JSON.stringify({
        userAgent: "test_browser",
        platform: "test_platform",
    })
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

    describe("POST /auth/signup/send-otp", () => {
        it("Should send OTP successfully after user submits their credentials.", async () => {
            console.log("Testing OTP send...")

            const response = await app.request("/auth/signup/send-otp", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(testUser),
            })

            console.log("Response status:", response.status);
            expect(response.status).toBe(200)
            const json = await response.json() as { message: string }
            console.log("Response body:", json)
            expect(json.message).toBe("Verification code sent to your email. Please check your inbox.")

            const userInDb = await prisma.user.findUnique({ where: { email: testUser.email } })
            console.log("User created in db:", userInDb?.email)
            expect(userInDb).toBeDefined()
            expect(userInDb?.emailVerified).toBe(false)

            const otpKeys = await redis.keys("otp:signup:*")
            console.log("OTP keys in Redis:", otpKeys.length)
            expect(otpKeys.length).toBe(1)

            const storedUserId = await redis.get(otpKeys[0])
            console.log("OTP value in Redis:", storedUserId)
            expect(storedUserId).toBe(userInDb?.id)

            console.log("Test Passed.")
        })

        it("Should reject duplicate username and email", async () => {
            console.log("Testing duplicate username...")

            await prisma.user.create({
                data: {
                    username: testUser.username,
                    email: testUser.email,
                    hashedPassword: testUser.password,
                    emailVerified: false
                }
            })

            const response = await app.request("/auth/signup/send-otp", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: testUser.username,
                    email: testUser.email,
                    password: testUser.password
                }),
            });

            expect(response.status).toBe(409)
            const json = await response.json() as { error: { code: string, message: string } }
            expect(json.error.code).toBe("AUTH_USERNAME_ALREADY_TAKEN")
            expect(json.error.message).toBe("This username is already taken. Try a different one.")
            console.log("Test Passed.")

        })

        it("Should reject duplicate email", async () => {
            console.log("Testing duplicate email...")

            await prisma.user.create({
                data: {
                    username: "jakepaul123",
                    email: testUser.email,
                    hashedPassword: testUser.password,
                    emailVerified: false
                }
            })

            const response = await app.request("/auth/signup/send-otp", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: testUser.username,
                    email: testUser.email,
                    password: "Different password"
                }),
            });
            expect(response.status).toBe(409)
            const json = await response.json() as { error: { code: string, message: string } }
            expect(json.error.code).toBe("AUTH_USER_ALREADY_EXISTS")
            expect(json.error.message).toBe("An account with this email already exists. Try logging in instead.")
            console.log("Test Passed.")
        })
    })


    describe("POST /auth/signup/verify-otp", () => {
        let validOTP: string;

        beforeEach(async () => {
            const response = await app.request("/auth/signup/send-otp", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(testUser),
            })
            expect(response.status).toBe(200)

            const otpKeys = await redis.keys("otp:signup:*")
            expect(otpKeys.length).toBe(1)
            validOTP = otpKeys[0].replace("otp:signup:", "")
            expect(validOTP).toBeDefined()
            console.log("Generated OTP:", validOTP);
        })

        it("Should verify OTP and create account successfully.", async () => {
            console.log("Testing OTP verification...");

            const response = await app.request("/auth/signup/verify", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Fingerprint": testDeviceId
                },
                body: JSON.stringify({
                    otp: validOTP,
                }),
            })

            console.log("Response status:", response.status);
            expect(response.status).toBe(201)
            const json = await response.json() as { message: string, accessToken: string }
            console.log("Response body:", json);
            expect(json.message).toBe("Welcome to FitThreads!")
            expect(json.accessToken).toBeTruthy()

            const cookies = response.headers.getSetCookie()
            console.log("Cookies set:", cookies.length);
            expect(cookies.length).toBeGreaterThan(0)

            const refreshCookie = cookies.find(c => c.includes("sid"))
            const csrfCookie = cookies.find(c => c.includes("csrfToken"))

            expect(refreshCookie).toBeTruthy()
            expect(csrfCookie).toBeTruthy()

            const user = await prisma.user.findUnique({ where: { email: testUser.email, emailVerified: true }, include: { sessions: true } })
            console.log("User is verified:", user?.emailVerified)
            expect(user?.emailVerified).toBe(true)
            expect(user?.emailVerifiedAt).toBeInstanceOf(Date);
            expect(user?.sessions.length).toBe(1)

            const otpStillExists = await redis.get(RedisKeys.signupOTP(validOTP))
            console.log("OTP still in Redis:", otpStillExists);
            expect(otpStillExists).toBeNull();

            console.log("Account verified and created successfully.")
        })

        it("Should reject invalid OTP", async () => {
            console.log("Testing invalid OTP...")

            const response = await app.request("/auth/signup/verify", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Fingerprint": testDeviceId
                },
                body: JSON.stringify({
                    otp: "999999",
                }),
            })

            console.log("Response status:", response.status);
            expect(response.status).toBe(401)
            const json = await response.json() as { error: { code: string, message: string } }
            console.log("Response body:", json);
            expect(json.error.code).toBe("AUTH_OTP_INVALID_OR_EXPIRED")

            console.log("Correctly rejected invalid OTP");
        })
    })

    describe("Full Signup Flow", () => {
        it("Should complete entire signup: send OTP => verify => create account => login", async () => {
            console.log("Testing full signup flow...")

            console.log("Sending OTP...")
            const response = await app.request("/auth/signup/send-otp", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Fingerprint": testDeviceId
                },
                body: JSON.stringify(testUser)
            })
            expect(response.status).toBe(200)

            console.log("Extracting OTP...")
            const otpKeys = await redis.keys("otp:signup:*")
            expect(otpKeys.length).toBe(1)
            const otp = otpKeys[0].replace("otp:signup:", "")
            expect(otp).toBeDefined()
            console.log("Generated OTP:", otp);

            console.log("Verifying OTP...")
            const verifyResponse = await app.request("/auth/signup/verify", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Fingerprint": testDeviceId
                },
                body: JSON.stringify({
                    otp,
                }),
            })
            expect(verifyResponse.status).toBe(201)

            const user = await prisma.user.findUnique({ where: { email: testUser.email, emailVerified: true }, include: { sessions: true } })
            console.log("User is verified:", user?.emailVerified)
            expect(user?.emailVerified).toBe(true)
            expect(user?.emailVerifiedAt).toBeInstanceOf(Date);
            expect(user?.sessions.length).toBe(1)

            console.log("User is verified and created successfully.")
        })
    })
})
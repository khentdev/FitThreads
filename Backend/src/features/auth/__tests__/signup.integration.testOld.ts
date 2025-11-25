import { describe, it, expect, beforeEach, afterAll, vi } from "vitest";
import { createApp } from "../../../createApp.js";
import { prisma } from "../../../../prisma/prismaConfig.js";
import { getRedisClient } from "../../../configs/redis.js";

// ============================================================================
// MOCK SETUP - We only mock external services we don't control
// ============================================================================
// Mock the email service (Resend) because we don't want to send real emails in tests
vi.mock("../../../configs/resend.js", () => ({
    sendEmail: vi.fn().mockResolvedValue({
        success: true,
        messageId: "test-message-id-123"
    })
}));

// ============================================================================
// TEST SUITE - Signup Integration Tests
// ============================================================================
describe("Signup Integration Tests", () => {
    // Create the Hono app instance (this includes all routes and middleware)
    const app = createApp();
    const redis = getRedisClient();

    // Test user data - we'll use this in multiple tests
    const testUser = {
        username: "testuser",
        email: "testuser@example.com",
        password: "SecurePass123!"
    };

    const testDeviceId = JSON.stringify({
        userAgent: "test-browser",
        platform: "test-platform"
    });

    // ========================================================================
    // SETUP & CLEANUP - Run before/after tests
    // ========================================================================

    // This runs BEFORE EACH test to ensure clean state
    beforeEach(async () => {
        console.log("🧹 Cleaning up before test...");

        // Delete test user if exists from previous test
        await prisma.user.deleteMany({
            where: { email: testUser.email }
        });

        // Clear all OTP keys from Redis
        const otpKeys = await redis.keys("otp:signup:*");
        if (otpKeys.length > 0) {
            await redis.del(...otpKeys);
        }

        console.log("✅ Cleanup complete");
    });

    // This runs AFTER ALL tests to clean up
    afterAll(async () => {
        console.log("🧹 Final cleanup...");
        await prisma.user.deleteMany({
            where: { email: testUser.email }
        });
        await prisma.$disconnect();
        console.log("✅ All done!");
    });

    // ========================================================================
    // TEST 1: Send OTP - Happy Path
    // ========================================================================
    describe("POST /auth/signup/send-otp", () => {
        it("should send OTP successfully when user provides valid data", async () => {
            console.log("📧 Testing OTP send...");

            // ACT - Make a request to the route
            const response = await app.request("/auth/signup/send-otp", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(testUser),
            });

            // ASSERT - Check the response
            console.log("Response status:", response.status);
            expect(response.status).toBe(200);

            const json = await response.json() as { message: string };
            console.log("Response body:", json);
            expect(json.message).toBe("Verification code sent to your email. Please check your inbox.");

            // ASSERT - Check database state
            const userInDb = await prisma.user.findUnique({
                where: { email: testUser.email }
            });
            console.log("User created in DB:", userInDb?.id);
            expect(userInDb).toBeDefined();
            expect(userInDb?.username).toBe(testUser.username);
            expect(userInDb?.emailVerified).toBe(false); // Should NOT be verified yet

            // ASSERT - Check Redis state
            const otpKeys = await redis.keys("otp:signup:*");
            console.log("OTP keys in Redis:", otpKeys.length);
            expect(otpKeys.length).toBe(1); // Should have exactly 1 OTP

            const storedUserId = await redis.get(otpKeys[0]);
            console.log("Stored userId in Redis:", storedUserId);
            expect(storedUserId).toBe(userInDb?.id);

            console.log("✅ Test passed!");
        });

        it("should reject duplicate email", async () => {
            console.log("🚫 Testing duplicate email rejection...");

            // ARRANGE - Create user first
            await prisma.user.create({
                data: {
                    username: "anotheruser",
                    email: testUser.email, // Same email
                    hashedPassword: "hashed",
                    emailVerified: false
                }
            });

            // ACT - Try to signup with same email
            const response = await app.request("/auth/signup/send-otp", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(testUser),
            });

            // ASSERT - Should fail
            expect(response.status).toBe(409); // Bad Request (per your error definition)
            const json = await response.json() as { error: { code: string } };
            expect(json.error.code).toBe("AUTH_USER_ALREADY_EXISTS");

            console.log("✅ Correctly rejected duplicate email");
        });
    });

    // ========================================================================
    // TEST 2: Verify OTP - Happy Path
    // ========================================================================
    describe("POST /auth/signup/verify", () => {
        let validOTP: string;

        // Run this before each test in this describe block
        beforeEach(async () => {
            console.log("📧 Sending OTP first...");

            // Send OTP first
            await app.request("/auth/signup/send-otp", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(testUser),
            });

            // Extract the OTP from Redis (in real life, user gets this via email)
            const otpKeys = await redis.keys("otp:signup:*");
            validOTP = otpKeys[0].replace("otp:signup:", "");
            console.log("Generated OTP:", validOTP);
        });

        it("should verify OTP and create account successfully", async () => {
            console.log("✅ Testing OTP verification...");

            // ACT - Verify the OTP
            const response = await app.request("/auth/signup/verify", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Fingerprint": testDeviceId,
                },
                body: JSON.stringify({
                    otp: validOTP,
                }),
            });

            // ASSERT - Response should be success
            console.log("Response status:", response.status);
            expect(response.status).toBe(201);

            const json = await response.json() as { message: string; accessToken: string };
            console.log("Response body:", json);
            expect(json.message).toBe("Welcome to FitThreads!");
            expect(json.accessToken).toBeTruthy(); // Should have access token

            // ASSERT - Cookies should be set
            const cookies = response.headers.getSetCookie();
            console.log("Cookies set:", cookies.length);
            expect(cookies.length).toBeGreaterThan(0);

            const refreshTokenCookie = cookies.find(c => c.includes("refreshToken"));
            const csrfTokenCookie = cookies.find(c => c.includes("csrfToken"));

            expect(refreshTokenCookie).toBeDefined();
            expect(csrfTokenCookie).toBeDefined();

            // ASSERT - User should be verified in database
            const user = await prisma.user.findUnique({
                where: { email: testUser.email },
                include: { sessions: true }
            });
            console.log("User verified:", user?.emailVerified);
            expect(user?.emailVerified).toBe(true);
            expect(user?.emailVerifiedAt).toBeInstanceOf(Date);
            expect(user?.sessions.length).toBe(1); // Should have 1 session

            // ASSERT - OTP should be deleted from Redis
            const otpStillExists = await redis.get(`otp:signup:${validOTP}`);
            console.log("OTP still in Redis:", otpStillExists);
            expect(otpStillExists).toBeNull(); // Should be deleted

            console.log("✅ Test passed!");
        });

        it("should reject invalid OTP", async () => {
            console.log("🚫 Testing invalid OTP rejection...");

            // ACT - Try with wrong OTP
            const response = await app.request("/auth/signup/verify", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Fingerprint": testDeviceId,
                },
                body: JSON.stringify({
                    otp: "999999", // Wrong OTP
                }),
            });

            // ASSERT - Should fail
            expect(response.status).toBe(401); // Bad Request (per your error definition)
            const json = await response.json() as { error: { code: string } };
            expect(json.error.code).toBe("AUTH_OTP_EXPIRED");

            console.log("✅ Correctly rejected invalid OTP");
        });
    });

    // ========================================================================
    // TEST 3: Full Flow - End to End
    // ========================================================================
    describe("Full Signup Flow", () => {
        it("should complete entire signup: send OTP → verify → account created", async () => {
            console.log("🚀 Testing full signup flow...");

            // STEP 1: Send OTP
            console.log("Step 1: Sending OTP...");
            const sendResponse = await app.request("/auth/signup/send-otp", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(testUser),
            });
            expect(sendResponse.status).toBe(200);

            // STEP 2: Extract OTP from Redis
            console.log("Step 2: Extracting OTP...");
            const otpKeys = await redis.keys("otp:signup:*");
            const otp = otpKeys[0].replace("otp:signup:", "");
            console.log("OTP:", otp);

            // STEP 3: Verify OTP
            console.log("Step 3: Verifying OTP...");
            const verifyResponse = await app.request("/auth/signup/verify", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Fingerprint": testDeviceId,
                },
                body: JSON.stringify({ otp }),
            });
            expect(verifyResponse.status).toBe(201);

            // STEP 4: Verify final state
            console.log("Step 4: Checking final state...");
            const user = await prisma.user.findUnique({
                where: { email: testUser.email },
                include: { sessions: true }
            });

            expect(user?.emailVerified).toBe(true);
            expect(user?.sessions.length).toBe(1);

            console.log("✅ Full flow completed successfully!");
        });
    });
});

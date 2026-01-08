import { vi, describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { createApp } from "../../../createApp.js";
import { cleanupTestKeys, getRedisClient } from "../../../configs/redis.js";
import { prisma } from "../../../../prisma/prismaConfig.js";
import bcrypt from "bcrypt";
import * as resend from "../../../configs/resend.js";
import { sendPasswordLinkService } from "../service.js";
import { RedisKeys } from "../utils/auth-keys.js";

vi.mock("../../../configs/resend.js")
const sendEmailMocked = vi.mocked(resend.sendEmail)
sendEmailMocked.mockResolvedValue({ success: true, messageId: "test_message_id" })

describe("Password Reset Verification Integration Tests", () => {

    const app = createApp()
    const redis = getRedisClient()

    const testUser = {
        email: "example@example.com"
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
        if (keys.length > 0)
            await redis.del(...keys)

    })

    afterAll(async () => {
        const keys = await redis.keys("otp:password-reset:*")
        if (keys.length > 0)
            await redis.del(...keys)

        await prisma.user.deleteMany({
            where: { email: testUser.email }
        })
        await prisma.$disconnect()
    })


    it.only("should successfully verify the token and reset the password", { timeout: 15000, }, async () => {
        const user = await prisma.user.create({
            data: {
                email: testUser.email,
                username: "testusername",
                hashedPassword: await bcrypt.hash("testpassword", 10),
                emailVerified: true,
                emailVerifiedAt: new Date()
            }
        })
        expect(user.email).toBe(testUser.email)


        const sendLinkResponse = await app.request("/auth/password", {
            method: "POST",
            body: JSON.stringify({ email: testUser.email }),
            headers: {
                "Content-Type": "application/json"
            }
        })
        expect(sendLinkResponse.status).toBe(200)

        const redisKey = await redis.keys("otp:password-reset:*")
        expect(redisKey.length).toBe(1)

        const token = redisKey[0].replace("otp:password-reset:", "")
        const email = await redis.get(RedisKeys.passwordOTP(token))
        expect(email).toBe(user.email)

        const verifyTokenResponse = await app.request("auth/password/verify", {
            method: "POST",
            body: JSON.stringify({ token, newPassword: "newpassword", confirmPassword: "newpassword" }),
            headers: {
                "Content-Type": "application/json",
                "X-Fingerprint": JSON.stringify(deviceId)
            }
        })
        expect(verifyTokenResponse.status).toBe(200)
        const cookies = verifyTokenResponse.headers.get("set-cookie")
        expect(cookies).toContain("sid=")
        expect(cookies).toContain("csrfToken=")

        const keyExists = await redis.get(token)
        expect(keyExists).toBeNull()

        const updatedUser = await prisma.user.findUnique({ where: { id: user.id } })
        expect(updatedUser).toBeDefined()

        const isMatched = await bcrypt.compare("newpassword", updatedUser!.hashedPassword)
        expect(isMatched).toBe(true)
    })

    it("should return 401 for invalid or expired token", async () => {
        const response = await app.request("auth/password/verify", {
            method: "POST",
            body: JSON.stringify({ token: "invalid-token", newPassword: "newpassword", confirmPassword: "newpassword" }),
            headers: {
                "Content-Type": "application/json",
                "X-Fingerprint": JSON.stringify(deviceId)
            }
        })
        expect(response.status).toBe(401)
        const json = await response.json() as any
        expect(json.error.code).toBe("AUTH_PASSWORD_RESET_LINK_INVALID_OR_EXPIRED")
    })

    it("should return 401 if token is missing", async () => {
        const response = await app.request("auth/password/verify", {
            method: "POST",
            body: JSON.stringify({ newPassword: "newpassword", confirmPassword: "newpassword" }),
            headers: {
                "Content-Type": "application/json",
                "X-Fingerprint": JSON.stringify(deviceId)
            }
        })
        expect(response.status).toBe(401)
        const json = await response.json() as any
        expect(json.error.code).toBe("AUTH_PASSWORD_RESET_LINK_INVALID_OR_EXPIRED")
    })

    it("should return 401 if password mismatch (newPassword, confirmPassword)", async () => {
        const response = await app.request("auth/password/verify", {
            method: "POST",
            body: JSON.stringify({ token: "invalid-token", newPassword: "newpassword", confirmPassword: "newpassword2" }),
            headers: {
                "Content-Type": "application/json",
                "X-Fingerprint": JSON.stringify(deviceId)
            }
        })
        expect(response.status).toBe(400)
        const json = await response.json() as any
        expect(json.error.code).toBe("AUTH_PASSWORD_RESET_PASSWORD_MISMATCH")
    })
});
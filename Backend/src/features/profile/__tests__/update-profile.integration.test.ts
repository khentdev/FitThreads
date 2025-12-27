import { afterAll, beforeEach, it, describe, beforeAll, expect } from "vitest";
import { prisma } from "../../../../prisma/prismaConfig.js";
import { createApp } from "../../../createApp.js";
import { generateTokens } from "../../session/tokens.js";
import { hashData } from "../../../lib/hash.js";


describe("Update Profile Integration Tests", () => {
    let app: ReturnType<typeof createApp>;

    beforeAll(() => {
        app = createApp()
    })

    const testUser = {
        username: "testuser",
        bio: "test bio",
        email: "testuser@gmail.com",
        isAdmin: false,
        hashedPassword: "testpassword",
        createdAt: new Date()
    }

    const testFingerprint = {
        user_agent: "test-user-agent",
        browser: "test-browser",
        os: "test-os",
        device: "test-device"
    }

    beforeEach(async () => {
        await prisma.user.deleteMany()
    })

    afterAll(async () => {
        await prisma.user.deleteMany()
        await prisma.$disconnect()
    })

    it("Should update user profile and return the updated profile", async () => {
        const user = await prisma.user.create({ data: testUser })
        const { accessToken } = await generateTokens({ deviceId: hashData(JSON.stringify(testFingerprint)), userId: user.id })

        const response = await app.request("/profile/update", {
            method: "PUT",
            body: JSON.stringify({
                bio: "new bio"
            }),
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            }
        })
        expect(response.status).toBe(200)

        const json = await response.json() as any
        expect(json).toEqual({
            username: testUser.username,
            bio: "new bio",
            joinedAt: expect.any(String),
            totalLikes: expect.any(Number)
        })
    })

    it("Should return 401 if user is not authenticated", async () => {
        const response = await app.request("/profile/update", {
            method: "PUT",
            body: JSON.stringify({
                bio: "new bio"
            })
        })
        expect(response.status).toBe(401)
    })


    it("Should return 'INVALID_PROFILE_BIO' error code", async () => {
        const user = await prisma.user.create({ data: testUser })
        const { accessToken } = await generateTokens({ deviceId: hashData(JSON.stringify(testFingerprint)), userId: user.id })

        const response = await app.request("/profile/update", {
            method: "PUT",
            body: JSON.stringify({
                bio: ["invalid_type_of_bio", { "invalid": "bio" }]
            }),
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            }
        })
        expect(response.status).toBe(400)

        const json = await response.json() as any
        expect(json.error.code).toBe("INVALID_PROFILE_BIO")
    })

    it("Should return 'PROFILE_BIO_LENGTH_EXCEEDED' error code", async () => {
        const user = await prisma.user.create({ data: testUser })
        const { accessToken } = await generateTokens({ deviceId: hashData(JSON.stringify(testFingerprint)), userId: user.id })

        const response = await app.request("/profile/update", {
            method: "PUT",
            body: JSON.stringify({
                bio: "bio".repeat(101)
            }),
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            }
        })
        expect(response.status).toBe(400)

        const json = await response.json() as any
        expect(json.error.code).toBe("PROFILE_BIO_LENGTH_EXCEEDED")
    })

    it("Should return 'USER_NOT_FOUND' error code", async () => {
        const { accessToken } = await generateTokens({ deviceId: hashData(JSON.stringify(testFingerprint)), userId: "64ca1407-a421-47db-9365-1c6e15bafd6b" })
        const response = await app.request("/profile/update", {
            method: "PUT",
            body: JSON.stringify({
                bio: "new bio"
            }),
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            }
        })
        expect(response.status).toBe(404)

        const json = await response.json() as any
        expect(json.error.code).toBe("AUTH_USER_NOT_FOUND")
    })
})
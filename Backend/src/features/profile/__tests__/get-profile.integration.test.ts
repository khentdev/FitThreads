import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { createApp } from "../../../createApp.js";
import { prisma } from "../../../../prisma/prismaConfig.js";


describe("GET /api/profile/:username", () => {
    const app = createApp()

    beforeEach(async () => {
        await prisma.user.deleteMany()
    })

    afterAll(async () => {
        await prisma.$disconnect()
    })

    const testUser = {
        username: "testuser",
        email: "testuser@gmail.com",
        hashedPassword: "testuserpassword",
    }
    it("Should return user's profile data", async () => {
        await prisma.user.create({ data: testUser })

        const response = await app.request(`/profile/${testUser.username}`, {
            method: "GET",
        })
        expect(response.status).toBe(200)

        const json = await response.json() as any
        expect(json.username).toBe(testUser.username)
        expect(json).toHaveProperty("username", testUser.username)
        expect(json.joinedAt).toBeTypeOf("string")
    })

    it("Should return 404 if user is not found", async () => {
        const response = await app.request("/profile/not_a_real_user", {
            method: "GET",
        })
        expect(response.status).toBe(404)

        const json = await response.json() as any
        expect(json.error.code).toBe("USER_NOT_FOUND")
    })

    it("Should return 400 if username is invalid format", async () => {
        const response = await app.request("/profile/![invalid-_-user]!", {
            method: "GET",
        })
        expect(response.status).toBe(400)

        const json = await response.json() as any
        expect(json.error.code).toBe("INVALID_USERNAME_FORMAT")
    })
})
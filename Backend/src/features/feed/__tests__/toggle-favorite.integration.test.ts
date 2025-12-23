import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { generateTokens } from "../../session/tokens.js";
import { prisma } from "../../../../prisma/prismaConfig.js";
import { createApp } from "../../../createApp.js";
import { hashData } from "../../../lib/hash.js";

describe("Toggle Favorite Integration Test", () => {
    const app = createApp()

    const testUser = {
        email: "test-user-favorite@example.com",
        name: "test-user-favorite",
        image: "test-user-image"
    }

    const testFingerprint = {
        user_agent: "test-user-agent",
        browser: "test-browser",
        os: "test-os",
        device: "test-device"
    }

    // Helper: Create test user
    const createTestUser = async () => {
        return await prisma.user.create({
            data: {
                email: testUser.email,
                username: testUser.name,
                emailVerified: true,
                emailVerifiedAt: new Date(),
                hashedPassword: "test-password",
                createdAt: new Date(),
            }
        })
    }

    // Helper: Create test post
    const createTestPost = async (authorId: string) => {
        return await prisma.post.create({
            data: {
                authorId,
                title: "Test Post for Favorite",
                content: "This is a test post content for testing favorite feature.",
                postTags: {
                    create: [{
                        tag: {
                            connectOrCreate: {
                                where: { name: "favoritetest" },
                                create: { name: "favoritetest" }
                            }
                        }
                    }]
                }
            }
        })
    }

    // Helper: Generate access token
    const createAccessToken = async (userId: string) => {
        const { accessToken } = await generateTokens({
            deviceId: hashData(JSON.stringify(testFingerprint)),
            userId
        })
        return accessToken
    }

    beforeEach(async () => {
        await prisma.favorite.deleteMany()
        await prisma.post.deleteMany()
        await prisma.user.deleteMany({ where: { email: testUser.email } })
    })

    afterAll(async () => {
        await prisma.favorite.deleteMany()
        await prisma.post.deleteMany()
        await prisma.user.deleteMany({ where: { email: testUser.email } })
        await prisma.$disconnect()
    })

    it("Should favorite a post and return correct state", async () => {
        const user = await createTestUser()
        const post = await createTestPost(user.id)
        const accessToken = await createAccessToken(user.id)

        const response = await app.request(`/feed/${post.id}/favorite`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${accessToken}` }
        })

        expect(response.status).toBe(200)
        const json = await response.json() as any

        expect(json).toHaveProperty("hasFavorited")
        expect(json).toHaveProperty("favoriteCount")

        expect(json.hasFavorited).toBe(true)
        expect(json.favoriteCount).toBe(1)

        const favoriteInDb = await prisma.favorite.findFirst({
            where: { postId: post.id, userId: user.id }
        })
        expect(favoriteInDb).toBeDefined()
    })

    it("Should unfavorite a post and return correct state", async () => {
        const user = await createTestUser()
        const post = await createTestPost(user.id)
        const accessToken = await createAccessToken(user.id)

        await prisma.favorite.create({
            data: { postId: post.id, userId: user.id }
        })
        const response = await app.request(`/feed/${post.id}/favorite`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${accessToken}` }
        })

        expect(response.status).toBe(200)
        const json = await response.json() as any

        expect(json.hasFavorited).toBe(false)
        expect(json.favoriteCount).toBe(0)

        const favoriteInDb = await prisma.favorite.findFirst({
            where: { postId: post.id, userId: user.id }
        })
        expect(favoriteInDb).toBeNull()
    })

    it("Should toggle favorite multiple times correctly", async () => {
        const user = await createTestUser()
        const post = await createTestPost(user.id)
        const accessToken = await createAccessToken(user.id)

        // Toggle 1: Favorite
        const favorite1 = await app.request(`/feed/${post.id}/favorite`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${accessToken}` }
        })
        const favoriteJson1 = await favorite1.json() as any
        expect(favoriteJson1.hasFavorited).toBe(true)
        expect(favoriteJson1.favoriteCount).toBe(1)

        // Toggle 2: Unfavorite
        const favorite2 = await app.request(`/feed/${post.id}/favorite`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${accessToken}` }
        })
        const favoriteJson2 = await favorite2.json() as any
        expect(favoriteJson2.hasFavorited).toBe(false)
        expect(favoriteJson2.favoriteCount).toBe(0)

        // Toggle 3: Favorite again
        const favorite3 = await app.request(`/feed/${post.id}/favorite`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${accessToken}` }
        })
        const favoriteJson3 = await favorite3.json() as any
        expect(favoriteJson3.hasFavorited).toBe(true)
        expect(favoriteJson3.favoriteCount).toBe(1)

        const finalFavorite = await prisma.favorite.findFirst({
            where: { postId: post.id, userId: user.id }
        })
        expect(finalFavorite).toBeDefined()
    })

    it("Should return 404 when favoriting a non-existent post", async () => {
        const user = await createTestUser()
        const accessToken = await createAccessToken(user.id)
        const nonExistentPostId = "00000000-0000-0000-0000-000000000000"

        const response = await app.request(`/feed/${nonExistentPostId}/favorite`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${accessToken}` }
        })

        expect(response.status).toBe(404)
        const json = await response.json() as any
        expect(json.error.code).toBe("POST_NOT_FOUND")
    })

    it("Should return 401 when unauthenticated", async () => {
        const user = await createTestUser()
        const post = await createTestPost(user.id)

        const response = await app.request(`/feed/${post.id}/favorite`, {
            method: "POST"
        })

        expect(response.status).toBe(401)
    })
})

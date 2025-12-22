import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { generateTokens } from "../../session/tokens.js";
import { prisma } from "../../../../prisma/prismaConfig.js";
import { createApp } from "../../../createApp.js";
import { hashData } from "../../../lib/hash.js";

describe("Toggle Like Integration Test", () => {
    const app = createApp()

    const testUser = {
        email: "test-user-like@example.com",
        name: "test-user-like",
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
                title: "Test Post for Like",
                content: "This is a test post content for testing like feature.",
                postTags: {
                    create: [{
                        tag: {
                            connectOrCreate: {
                                where: { name: "liketest" },
                                create: { name: "liketest" }
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
        await prisma.like.deleteMany()
        await prisma.post.deleteMany()
        await prisma.user.deleteMany({ where: { email: testUser.email } })
    })

    afterAll(async () => {
        await prisma.like.deleteMany()
        await prisma.post.deleteMany()
        await prisma.user.deleteMany({ where: { email: testUser.email } })
        await prisma.$disconnect()
    })

    it("Should like a post and return correct state", async () => {
        const user = await createTestUser()
        const post = await createTestPost(user.id)
        const accessToken = await createAccessToken(user.id)

        const response = await app.request(`/feed/${post.id}/like`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${accessToken}` }
        })

        expect(response.status).toBe(200)
        const json = await response.json() as any

        expect(json).toHaveProperty("hasLiked")
        expect(json).toHaveProperty("likeCount")

        expect(json.hasLiked).toBe(true)
        expect(json.likeCount).toBe(1)

        const likeInDb = await prisma.like.findFirst({
            where: { postId: post.id, userId: user.id }
        })
        expect(likeInDb).toBeDefined()
    })

    it("Should unlike a post and return correct state", async () => {
        const user = await createTestUser()
        const post = await createTestPost(user.id)
        const accessToken = await createAccessToken(user.id)

        await prisma.like.create({
            data: { postId: post.id, userId: user.id }
        })
        const response = await app.request(`/feed/${post.id}/like`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${accessToken}` }
        })

        expect(response.status).toBe(200)
        const json = await response.json() as any

        expect(json.hasLiked).toBe(false)
        expect(json.likeCount).toBe(0)

        const likeInDb = await prisma.like.findFirst({
            where: { postId: post.id, userId: user.id }
        })
        expect(likeInDb).toBeNull()
    })

    it("Should toggle like multiple times correctly", async () => {
        const user = await createTestUser()
        const post = await createTestPost(user.id)
        const accessToken = await createAccessToken(user.id)

        // Toggle 1: Like
        const like1 = await app.request(`/feed/${post.id}/like`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${accessToken}` }
        })
        const likeJson1 = await like1.json() as any
        expect(likeJson1.hasLiked).toBe(true)
        expect(likeJson1.likeCount).toBe(1)

        // Toggle 2: Unlike
        const like2 = await app.request(`/feed/${post.id}/like`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${accessToken}` }
        })
        const likeJson2 = await like2.json() as any
        expect(likeJson2.hasLiked).toBe(false)
        expect(likeJson2.likeCount).toBe(0)

        // Toggle 3: Like again
        const like3 = await app.request(`/feed/${post.id}/like`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${accessToken}` }
        })
        const likeJson3 = await like3.json() as any
        expect(likeJson3.hasLiked).toBe(true)
        expect(likeJson3.likeCount).toBe(1)

        const finalLike = await prisma.like.findFirst({
            where: { postId: post.id, userId: user.id }
        })
        expect(finalLike).toBeDefined()
    })

    it("Should return 404 when liking a non-existent post", async () => {
        const user = await createTestUser()
        const accessToken = await createAccessToken(user.id)
        const nonExistentPostId = "00000000-0000-0000-0000-000000000000"

        const response = await app.request(`/feed/${nonExistentPostId}/like`, {
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

        const response = await app.request(`/feed/${post.id}/like`, {
            method: "POST"
        })

        expect(response.status).toBe(401)
    })
})

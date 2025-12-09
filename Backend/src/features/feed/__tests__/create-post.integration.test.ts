import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { generateTokens } from "../../session/tokens.js";
import { prisma } from "../../../../prisma/prismaConfig.js";
import { createApp } from "../../../createApp.js";
import { hashData } from "../../../lib/hash.js";

describe("Create Post Integration Test", () => {
    const app = createApp()

    const testUser = {
        email: "test-user-email@example.com",
        name: "test-user-name",
        image: "test-user-image"
    }

    const testFingerprint = {
        user_agent: "test-user-agent",
        browser: "test-browser",
        os: "test-os",
        device: "test-device"
    }

    beforeEach(async () => {
        await prisma.user.deleteMany({ where: { email: testUser.email } })
    })

    afterAll(async () => {
        await prisma.user.deleteMany({ where: { email: testUser.email } })
        await prisma.$disconnect()
    })

    it("Should create a new post with 5 tags", async () => {
        const user = await prisma.user.create({
            data: {
                email: testUser.email,
                username: testUser.name,
                emailVerified: true,
                emailVerifiedAt: new Date(),
                hashedPassword: "test-password",
                createdAt: new Date(),
                updatedAt: new Date()
            }
        })

        const { accessToken } = await generateTokens({ deviceId: hashData(JSON.stringify(testFingerprint)), userId: user.id })

        const response = await app.request("/feed/create-post", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title: "test-title",
                content: "Fitness is very good for your health because it will give you a healthy body and a healthy lifestyle.",
                postTags: ["testtag1", "testtag2", "testtag3", "testtag4", "testtag5"]
            })
        })

        const json = await response.json() as any
        expect(response.status).toBe(201)
        expect(json.message).toBe("Your fitness thought is now live!")

        const post = await prisma.post.findFirst({ where: { authorId: user.id }, include: { postTags: { select: { tag: { select: { name: true } } }, orderBy: { tag: { name: "asc" } } } } })
        const tagNames = post?.postTags.map((tag) => tag.tag.name)

        expect(post).toBeDefined()
        expect(post?.postTags.length).toBe(5)
        expect(tagNames).toEqual(["testtag1", "testtag2", "testtag3", "testtag4", "testtag5"])
    })

    describe("Middleware Validation Tests", () => {
        let user: any
        let accessToken: string

        beforeEach(async () => {
            user = await prisma.user.create({
                data: {
                    email: testUser.email,
                    username: testUser.name,
                    emailVerified: true,
                    emailVerifiedAt: new Date(),
                    hashedPassword: "test-password",
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            })

            const tokens = await generateTokens({ deviceId: hashData(JSON.stringify(testFingerprint)), userId: user.id })
            accessToken = tokens.accessToken
        })

        describe("Title Validation", () => {
            it("Should reject title below minimum length (6 characters)", async () => {
                const response = await app.request("/feed/create-post", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${accessToken}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        title: "Short",
                        content: "This is a valid content that meets the minimum length requirement for a post.",
                        postTags: ["fitness"]
                    })
                })

                const json = await response.json() as any
                expect(response.status).toBe(400)
                expect(json.error.code).toBe("TITLE_MIN_LENGTH")
            })

            it("Should reject title above maximum length (100 characters)", async () => {
                const longTitle = "a".repeat(101)
                const response = await app.request("/feed/create-post", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${accessToken}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        title: longTitle,
                        content: "This is a valid content that meets the minimum length requirement for a post.",
                        postTags: ["fitness"]
                    })
                })

                const json = await response.json() as any
                expect(response.status).toBe(400)
                expect(json.error.code).toBe("TITLE_MAX_LENGTH")
            })

            it("Should accept title at minimum boundary (6 characters)", async () => {
                const response = await app.request("/feed/create-post", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${accessToken}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        title: "123456",
                        content: "This is a valid content that meets the minimum length requirement for a post.",
                        postTags: ["fitness"]
                    })
                })

                expect(response.status).toBe(201)
            })

            it("Should accept title at maximum boundary (100 characters)", async () => {
                const maxTitle = "a".repeat(100)
                const response = await app.request("/feed/create-post", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${accessToken}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        title: maxTitle,
                        content: "This is a valid content that meets the minimum length requirement for a post.",
                        postTags: ["fitness"]
                    })
                })

                expect(response.status).toBe(201)
            })
        })

        describe("Content Validation", () => {
            it("Should reject content below minimum length (20 characters)", async () => {
                const response = await app.request("/feed/create-post", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${accessToken}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        title: "Valid Title",
                        content: "Too short",
                        postTags: ["fitness"]
                    })
                })

                const json = await response.json() as any
                expect(response.status).toBe(400)
                expect(json.error.code).toBe("CONTENT_MIN_LENGTH")
            })

            it("Should reject content above maximum length (500 characters)", async () => {
                const longContent = "a".repeat(501)
                const response = await app.request("/feed/create-post", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${accessToken}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        title: "Valid Title",
                        content: longContent,
                        postTags: ["fitness"]
                    })
                })

                const json = await response.json() as any
                expect(response.status).toBe(400)
                expect(json.error.code).toBe("CONTENT_MAX_LENGTH")
            })

            it("Should accept content at minimum boundary (20 characters)", async () => {
                const response = await app.request("/feed/create-post", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${accessToken}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        title: "Valid Title",
                        content: "12345678901234567890",
                        postTags: ["fitness"]
                    })
                })

                expect(response.status).toBe(201)
            })

            it("Should accept content at maximum boundary (500 characters)", async () => {
                const maxContent = "a".repeat(500)
                const response = await app.request("/feed/create-post", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${accessToken}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        title: "Valid Title",
                        content: maxContent,
                        postTags: ["fitness"]
                    })
                })

                expect(response.status).toBe(201)
            })
        })

        describe("PostTags Array Validation", () => {
            it("Should reject when postTags is not an array", async () => {
                const response = await app.request("/feed/create-post", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${accessToken}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        title: "Valid Title",
                        content: "This is a valid content that meets the minimum length requirement for a post.",
                        postTags: "not-an-array"
                    })
                })

                const json = await response.json() as any
                expect(response.status).toBe(400)
                expect(json.error.code).toBe("POST_TAGS_INVALID")
            })

            it("Should reject when postTags is an empty array", async () => {
                const response = await app.request("/feed/create-post", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${accessToken}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        title: "Valid Title",
                        content: "This is a valid content that meets the minimum length requirement for a post.",
                        postTags: []
                    })
                })

                const json = await response.json() as any
                expect(response.status).toBe(400)
                expect(json.error.code).toBe("POST_TAGS_INVALID")
            })

            it("Should reject when postTags exceeds maximum count (5 tags)", async () => {
                const response = await app.request("/feed/create-post", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${accessToken}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        title: "Valid Title",
                        content: "This is a valid content that meets the minimum length requirement for a post.",
                        postTags: ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6"]
                    })
                })

                const json = await response.json() as any
                expect(response.status).toBe(400)
                expect(json.error.code).toBe("POST_TAGS_LIMIT_EXCEEDED")
            })

            it("Should accept postTags at minimum boundary (1 tag)", async () => {
                const response = await app.request("/feed/create-post", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${accessToken}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        title: "Valid Title",
                        content: "This is a valid content that meets the minimum length requirement for a post.",
                        postTags: ["fitness"]
                    })
                })

                expect(response.status).toBe(201)
            })

            it("Should accept postTags at maximum boundary (5 tags)", async () => {
                const response = await app.request("/feed/create-post", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${accessToken}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        title: "Valid Title",
                        content: "This is a valid content that meets the minimum length requirement for a post.",
                        postTags: ["tag1", "tag2", "tag3", "tag4", "tag5"]
                    })
                })

                expect(response.status).toBe(201)
            })
        })

        describe("Individual Tag Validation", () => {
            it("Should reject tag below minimum length (2 characters)", async () => {
                const response = await app.request("/feed/create-post", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${accessToken}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        title: "Valid Title",
                        content: "This is a valid content that meets the minimum length requirement for a post.",
                        postTags: ["a"]
                    })
                })

                const json = await response.json() as any
                expect(response.status).toBe(400)
                expect(json.error.code).toBe("POST_TAG_MIN_LENGTH")
            })

            it("Should reject tag above maximum length (30 characters)", async () => {
                const longTag = "a".repeat(31)
                const response = await app.request("/feed/create-post", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${accessToken}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        title: "Valid Title",
                        content: "This is a valid content that meets the minimum length requirement for a post.",
                        postTags: [longTag]
                    })
                })

                const json = await response.json() as any
                expect(response.status).toBe(400)
                expect(json.error.code).toBe("POST_TAG_MAX_LENGTH")
            })

            it("Should reject when one tag in array is invalid (among valid tags)", async () => {
                const response = await app.request("/feed/create-post", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${accessToken}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        title: "Valid Title",
                        content: "This is a valid content that meets the minimum length requirement for a post.",
                        postTags: ["validtag", "a", "anothertag"]
                    })
                })

                const json = await response.json() as any
                expect(response.status).toBe(400)
                expect(json.error.code).toBe("POST_TAG_MIN_LENGTH")
            })

            it("Should accept tag at minimum boundary (2 characters)", async () => {
                const response = await app.request("/feed/create-post", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${accessToken}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        title: "Valid Title",
                        content: "This is a valid content that meets the minimum length requirement for a post.",
                        postTags: ["ab"]
                    })
                })

                expect(response.status).toBe(201)
            })

            it("Should accept tag at maximum boundary (30 characters)", async () => {
                const maxTag = "a".repeat(30)
                const response = await app.request("/feed/create-post", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${accessToken}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        title: "Valid Title",
                        content: "This is a valid content that meets the minimum length requirement for a post.",
                        postTags: [maxTag]
                    })
                })

                expect(response.status).toBe(201)
            })

            it("Should reject tag with invalid characters (non-alphanumeric)", async () => {
                const response = await app.request("/feed/create-post", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${accessToken}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        title: "Valid Title",
                        content: "This is a valid content that meets the minimum length requirement for a post.",
                        postTags: ["invalid-tag!"]
                    })
                })

                const json = await response.json() as any
                expect(response.status).toBe(400)
                expect(json.error.code).toBe("POST_TAG_FORMAT_INVALID")
            })
        })
    })
})

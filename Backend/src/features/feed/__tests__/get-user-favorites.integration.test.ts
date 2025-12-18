import { describe, it, expect, beforeEach, afterAll, beforeAll } from "vitest";
import { createApp } from "../../../createApp.js";
import { prisma } from "../../../../prisma/prismaConfig.js";

describe("GET /api/feed/favorites - Get User Favorited Posts", () => {
    let app: ReturnType<typeof createApp>;

    beforeAll(() => {
        app = createApp();
    });

    beforeEach(async () => {
        await prisma.favorite.deleteMany();
        await prisma.like.deleteMany();
        await prisma.postTag.deleteMany();
        await prisma.post.deleteMany();
        await prisma.tag.deleteMany();
        await prisma.user.deleteMany();

        await prisma.user.createMany({
            data: [
                { username: "alice_lifter", email: "alice@test.com", hashedPassword: "pass", bio: "Loves heavy squats" },
                { username: "bob_runner", email: "bob@test.com", hashedPassword: "pass", bio: "Marathon enthusiast" },
                { username: "charlie_yoga", email: "charlie@test.com", hashedPassword: "pass", bio: "Flexible and calm" },
                { username: "dave_noFavorites", email: "dave@test.com", hashedPassword: "pass", bio: "Never favorites anything" },
            ]
        });

        const alice = await prisma.user.findUnique({ where: { username: "alice_lifter" } });
        const bob = await prisma.user.findUnique({ where: { username: "bob_runner" } });
        const charlie = await prisma.user.findUnique({ where: { username: "charlie_yoga" } });

        if (!alice || !bob || !charlie) throw new Error("Failed to create users");

        await prisma.tag.createMany({
            data: [
                { name: "Weights" },
                { name: "Running" },
                { name: "Yoga" },
                { name: "Nutrition" },
            ]
        });

        const weightsTag = await prisma.tag.findUnique({ where: { name: "Weights" } });
        const runningTag = await prisma.tag.findUnique({ where: { name: "Running" } });
        await prisma.tag.findUnique({ where: { name: "Yoga" } });

        const posts = [];
        for (let i = 1; i <= 25; i++) {
            const createdAt = new Date(Date.now() - i * 10000);
            const post = await prisma.post.create({
                data: {
                    title: `Post ${i}`,
                    content: `Content for post ${i}`,
                    authorId: i % 3 === 0 ? bob.id : i % 2 === 0 ? charlie.id : alice.id,
                    createdAt,
                }
            });
            posts.push(post);

            if (weightsTag && i % 3 === 0) {
                await prisma.postTag.create({ data: { postId: post.id, tagId: weightsTag.id } });
            }
            if (runningTag && i % 5 === 0) {
                await prisma.postTag.create({ data: { postId: post.id, tagId: runningTag.id } });
            }
        }

        for (let i = 0; i < posts.length; i++) {
            const post = posts[i];
            if (i < 22) {
                const createdAt = new Date(Date.now() - (posts.length - i) * 5000);
                await prisma.favorite.create({
                    data: {
                        userId: alice.id,
                        postId: post.id,
                        createdAt,
                    }
                });
            }

            if (i % 2 === 0 && i < 5) {
                await prisma.favorite.create({
                    data: {
                        userId: bob.id,
                        postId: post.id,
                    }
                });
            }

            if (i < 3) {
                await prisma.like.create({
                    data: {
                        userId: charlie.id,
                        postId: post.id,
                    }
                });
            }
        }
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    it("should return favorited posts for a valid user", async () => {
        const response = await app.request("/feed/favorites?username=alice_lifter");
        expect(response.status).toBe(200);
        const json = await response.json() as any;

        expect(json.data).toBeDefined();
        expect(Array.isArray(json.data)).toBe(true);
        expect(json.data.length).toBeGreaterThan(0);
        expect(json.data[0].post).toBeDefined();
        expect(json.data[0].post.title).toBeDefined();
        expect(json.data[0].post.content).toBeDefined();
        expect(json.data[0].post.author).toBeDefined();
    });

    it("should return 404 when user does not exist", async () => {
        const response = await app.request("/feed/favorites?username=nonexistent_user");
        expect(response.status).toBe(404);
        const json = await response.json() as any;
        expect(json.error).toBeDefined();
        expect(json.error.code).toBe("USER_NOT_FOUND");
    });

    it("should return empty array when user has no favorites", async () => {
        const response = await app.request("/feed/favorites?username=dave_noFavorites");
        expect(response.status).toBe(200);
        const json = await response.json() as any;

        expect(json.data).toEqual([]);
        expect(json.hasMore).toBe(false);
        expect(json.nextCursor).toBeNull();
    });

    it("should order favorites by createdAt descending then postId descending", async () => {
        const response = await app.request("/feed/favorites?username=alice_lifter&limit=5");
        expect(response.status).toBe(200);
        const json = await response.json() as any;

        expect(json.data.length).toBeLessThanOrEqual(5);

        for (let i = 0; i < json.data.length - 1; i++) {
            const current = new Date(json.data[i].createdAt).getTime();
            const next = new Date(json.data[i + 1].createdAt).getTime();
            expect(current).toBeGreaterThanOrEqual(next);
        }
    });

    it("should paginate correctly with default limit (20)", async () => {
        const response = await app.request("/feed/favorites?username=alice_lifter");
        expect(response.status).toBe(200);
        const json = await response.json() as any;

        expect(json.data.length).toBe(20);
        expect(json.hasMore).toBe(true);
        expect(json.nextCursor).toBeDefined();
        expect(json.nextCursor).not.toBeNull();
    });

    it("should paginate correctly with custom limit", async () => {
        const response = await app.request("/feed/favorites?username=alice_lifter&limit=10");
        expect(response.status).toBe(200);
        const json = await response.json() as any;

        expect(json.data.length).toBe(10);
        expect(json.hasMore).toBe(true);
        expect(json.nextCursor).toBeDefined();
    });

    it("should respect maximum limit of 20", async () => {
        const response = await app.request("/feed/favorites?username=alice_lifter&limit=100");
        expect(response.status).toBe(200);
        const json = await response.json() as any;

        expect(json.data.length).toBeLessThanOrEqual(20);
    });

    it("should respect minimum limit of 1", async () => {
        const response = await app.request("/feed/favorites?username=alice_lifter&limit=0");
        expect(response.status).toBe(200);
        const json = await response.json() as any;

        expect(json.data.length).toBeGreaterThan(0);
    });

    it("should handle cursor-based pagination correctly", async () => {
        const page1 = await app.request("/feed/favorites?username=alice_lifter&limit=10");
        const json1 = await page1.json() as any;

        expect(json1.hasMore).toBe(true);
        expect(json1.nextCursor).toBeDefined();

        const page2 = await app.request(`/feed/favorites?username=alice_lifter&limit=10&cursor=${json1.nextCursor}`);
        const json2 = await page2.json() as any;

        expect(json2.data.length).toBeGreaterThan(0);

        const page1Ids = json1.data.map((item: any) => item.post.id);
        const page2Ids = json2.data.map((item: any) => item.post.id);
        const intersection = page1Ids.filter((id: string) => page2Ids.includes(id));
        expect(intersection).toHaveLength(0);
    });

    it("should handle multi-page pagination until end", async () => {
        const page1 = await app.request("/feed/favorites?username=alice_lifter&limit=10");
        const json1 = await page1.json() as any;

        const page2 = await app.request(`/feed/favorites?username=alice_lifter&limit=10&cursor=${json1.nextCursor}`);
        const json2 = await page2.json() as any;

        const page3 = await app.request(`/feed/favorites?username=alice_lifter&limit=10&cursor=${json2.nextCursor}`);
        const json3 = await page3.json() as any;

        expect(json3.data.length).toBeGreaterThan(0);
        expect(json3.hasMore).toBe(false);
        expect(json3.nextCursor).toBeNull();
    });

    it("should include post details (title, content, author, tags, counts)", async () => {
        const response = await app.request("/feed/favorites?username=alice_lifter&limit=5");
        expect(response.status).toBe(200);
        const json = await response.json() as any;

        expect(json.data.length).toBeGreaterThan(0);

        const firstFavorite = json.data[0];
        expect(firstFavorite.post.id).toBeDefined();
        expect(firstFavorite.post.title).toBeDefined();
        expect(firstFavorite.post.content).toBeDefined();
        expect(firstFavorite.post.createdAt).toBeDefined();
        expect(firstFavorite.post.author.id).toBeDefined();
        expect(firstFavorite.post.author.username).toBeDefined();
        expect(firstFavorite.post.postTags).toBeDefined();
        expect(Array.isArray(firstFavorite.post.postTags)).toBe(true);
        expect(firstFavorite.post._count.likes).toBeDefined();
        expect(firstFavorite.post._count.favorites).toBeDefined();
    });

    it("should handle invalid cursor gracefully", async () => {
        const response = await app.request("/feed/favorites?username=alice_lifter&cursor=invalid_cursor_string");
        expect(response.status).toBe(200);
        const json = await response.json() as any;

        expect(json.data.length).toBeGreaterThan(0);
    });

    it("should handle malformed cursor (not base64)", async () => {
        const response = await app.request("/feed/favorites?username=alice_lifter&cursor=@@@###$$$");
        expect(response.status).toBe(200);
        const json = await response.json() as any;

        expect(json.data).toBeDefined();
    });

    it("should handle cursor with invalid UUID", async () => {
        const invalidCursor = Buffer.from(JSON.stringify({ id: "not-a-uuid", createdAt: new Date().toISOString() })).toString('base64url');
        const response = await app.request(`/feed/favorites?username=alice_lifter&cursor=${invalidCursor}`);
        expect(response.status).toBe(200);
        const json = await response.json() as any;

        expect(json.data).toBeDefined();
    });

    it("should handle cursor with invalid date", async () => {
        const alice = await prisma.user.findUnique({ where: { username: "alice_lifter" } });
        if (!alice) throw new Error("Alice not found");

        const invalidCursor = Buffer.from(JSON.stringify({ id: alice.id, createdAt: "not-a-date" })).toString('base64url');
        const response = await app.request(`/feed/favorites?username=alice_lifter&cursor=${invalidCursor}`);
        expect(response.status).toBe(200);
        const json = await response.json() as any;

        expect(json.data).toBeDefined();
    });

    it("should default username to empty string when not provided", async () => {
        const response = await app.request("/feed/favorites");
        expect(response.status).toBe(404);
        const json = await response.json() as any;
        expect(json.error.code).toBe("USER_NOT_FOUND");
    });

    it("should correctly count likes and favorites for each post", async () => {
        const response = await app.request("/feed/favorites?username=alice_lifter&limit=3");
        expect(response.status).toBe(200);
        const json = await response.json() as any;

        for (const favorite of json.data) {
            expect(typeof favorite.post._count.likes).toBe('number');
            expect(typeof favorite.post._count.favorites).toBe('number');
            expect(favorite.post._count.likes).toBeGreaterThanOrEqual(0);
            expect(favorite.post._count.favorites).toBeGreaterThanOrEqual(0);
        }
    });

    it("should return favorites from multiple authors", async () => {
        const response = await app.request("/feed/favorites?username=alice_lifter");
        expect(response.status).toBe(200);
        const json = await response.json() as any;

        const uniqueAuthors = new Set(json.data.map((item: any) => item.post.author.username));
        expect(uniqueAuthors.size).toBeGreaterThan(1);
    });

    it("should include bio for post authors", async () => {
        const response = await app.request("/feed/favorites?username=alice_lifter&limit=5");
        expect(response.status).toBe(200);
        const json = await response.json() as any;

        for (const favorite of json.data) {
            expect(favorite.post.author.bio).toBeDefined();
        }
    });

    it("should not skip first item when cursor is not provided", async () => {
        const page1 = await app.request("/feed/favorites?username=alice_lifter&limit=1");
        const json1 = await page1.json() as any;

        const page2 = await app.request("/feed/favorites?username=alice_lifter&limit=1");
        const json2 = await page2.json() as any;

        expect(json1.data[0].post.id).toBe(json2.data[0].post.id);
    });

    it("should skip cursor item when cursor is provided", async () => {
        const page1 = await app.request("/feed/favorites?username=alice_lifter&limit=1");
        const json1 = await page1.json() as any;

        const page2 = await app.request(`/feed/favorites?username=alice_lifter&limit=1&cursor=${json1.nextCursor}`);
        const json2 = await page2.json() as any;

        expect(json1.data[0].post.id).not.toBe(json2.data[0].post.id);
    });
});

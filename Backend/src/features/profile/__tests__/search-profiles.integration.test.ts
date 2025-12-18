import { describe, it, expect, beforeEach, afterAll, beforeAll } from "vitest";
import { createApp } from "../../../createApp.js";
import { prisma } from "../../../../prisma/prismaConfig.js";

describe("GET /api/profile/search - Search Profiles", () => {
    let app: ReturnType<typeof createApp>;

    beforeAll(() => {
        app = createApp();
    });

    beforeEach(async () => {
        await prisma.like.deleteMany();
        await prisma.post.deleteMany();
        await prisma.user.deleteMany();

        await prisma.user.createMany({
            data: [
                { username: "alice_lifter", email: "alice@test.com", hashedPassword: "pass", bio: "Loves heavy squats", createdAt: new Date("2023-01-01") },
                { username: "bob_runner", email: "bob@test.com", hashedPassword: "pass", bio: "Marathon enthusiast", createdAt: new Date("2023-02-01") },
                { username: "charlie_yoga", email: "charlie@test.com", hashedPassword: "pass", bio: "Flexible and calm", createdAt: new Date("2023-03-01") },
                { username: "david_crossfit", email: "david@test.com", hashedPassword: "pass", bio: "Jack of all trades", createdAt: new Date("2023-04-01") },
                { username: "eve_nobio", email: "eve@test.com", hashedPassword: "pass", bio: null, createdAt: new Date("2023-05-01") },
                { username: "frank_special", email: "frank@test.com", hashedPassword: "pass", bio: "Loves @fitness and #motivation!", createdAt: new Date("2023-06-01") },
                { username: "admin_user", email: "admin@test.com", hashedPassword: "pass", bio: "System Admin", isAdmin: true },
            ]
        });

        const alice = await prisma.user.findUnique({ where: { username: "alice_lifter" } });
        const bob = await prisma.user.findUnique({ where: { username: "bob_runner" } });
        const charlie = await prisma.user.findUnique({ where: { username: "charlie_yoga" } });
        const frank = await prisma.user.findUnique({ where: { username: "frank_special" } });

        if (alice && bob && charlie && frank) {
            const p1 = await prisma.post.create({ data: { authorId: alice.id, title: "Squat PR", content: "Hit 315!" } });
            const p2 = await prisma.post.create({ data: { authorId: alice.id, title: "Leg day", content: "Ouch" } });
            const p3 = await prisma.post.create({ data: { authorId: alice.id, title: "Deleted", content: "Gone", deletedAt: new Date() } });

            const p4 = await prisma.post.create({ data: { authorId: bob.id, title: "Long run", content: "20 miles" } });

            await prisma.like.create({ data: { userId: bob.id, postId: p1.id } });
            await prisma.like.create({ data: { userId: charlie.id, postId: p1.id } });
            await prisma.like.create({ data: { userId: charlie.id, postId: p2.id } });
            await prisma.like.create({ data: { userId: alice.id, postId: p4.id } });
            await prisma.like.create({ data: { userId: alice.id, postId: p3.id } });
        }
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    it("should search profiles by username prefix", async () => {
        const response = await app.request("/profile/search?searchQuery=ali");
        expect(response.status).toBe(200);
        const json = await response.json() as any;

        expect(json.users).toHaveLength(1);
        expect(json.users[0].username).toBe("alice_lifter");
    });

    it("should search profiles by username contains (case insensitive)", async () => {
        const response = await app.request("/profile/search?searchQuery=LIFT");
        expect(response.status).toBe(200);
        const json = await response.json() as any;

        expect(json.users).toHaveLength(1);
        expect(json.users[0].username).toBe("alice_lifter");
    });

    it("should search profiles by bio content", async () => {
        const response = await app.request("/profile/search?searchQuery=Marathon");
        expect(response.status).toBe(200);
        const json = await response.json() as any;

        expect(json.users).toHaveLength(1);
        expect(json.users[0].username).toBe("bob_runner");
    });

    it("should search profiles by bio content (case insensitive)", async () => {
        const response = await app.request("/profile/search?searchQuery=marathon");
        expect(response.status).toBe(200);
        const json = await response.json() as any;

        expect(json.users).toHaveLength(1);
        expect(json.users[0].username).toBe("bob_runner");
    });

    it("should exclude admin users from search results", async () => {
        const response = await app.request("/profile/search?searchQuery=admin");
        expect(response.status).toBe(200);
        const json = await response.json() as any;

        expect(json.users).toHaveLength(0);
    });

    it("should calculate totalLikes correctly", async () => {
        const response = await app.request("/profile/search?searchQuery=alice");
        expect(response.status).toBe(200);
        const json = await response.json() as any;

        expect(json.users[0].username).toBe("alice_lifter");
        expect(json.users[0].totalLikes).toBe(3);
    });

    it("should exclude likes from deleted posts when calculating totalLikes", async () => {
        const response = await app.request("/profile/search?searchQuery=alice");
        expect(response.status).toBe(200);
        const json = await response.json() as any;

        expect(json.users[0].username).toBe("alice_lifter");
        expect(json.users[0].totalLikes).toBe(3);
    });

    it("should return totalLikes as 0 for users with no posts", async () => {
        const response = await app.request("/profile/search?searchQuery=eve");
        expect(response.status).toBe(200);
        const json = await response.json() as any;

        expect(json.users[0].username).toBe("eve_nobio");
        expect(json.users[0].totalLikes).toBe(0);
    });

    it("should sort results alphabetically by username", async () => {
        const response = await app.request("/profile/search?searchQuery=e");
        expect(response.status).toBe(200);
        const json = await response.json() as any;

        expect(json.users.length).toBeGreaterThan(1);

        const usernames = json.users.map((u: any) => u.username);
        const sortedUsernames = [...usernames].sort();
        expect(usernames).toEqual(sortedUsernames);
    });

    it("should handle pagination with limit", async () => {
        const response = await app.request("/profile/search?searchQuery=e&limit=2");
        expect(response.status).toBe(200);
        const json = await response.json() as any;

        expect(json.users).toHaveLength(2);
        expect(json.hasMore).toBe(true);
        expect(json.nextCursor).toBeDefined();
    });

    it("should handle pagination with cursor", async () => {
        const res1 = await app.request("/profile/search?searchQuery=e&limit=2");
        const json1 = await res1.json() as any;
        const cursor = json1.nextCursor;

        const res2 = await app.request(`/profile/search?searchQuery=e&limit=2&cursor=${cursor}`);
        const json2 = await res2.json() as any;

        expect(json2.users).toHaveLength(2);

        const users1 = json1.users.map((u: any) => u.username);
        const users2 = json2.users.map((u: any) => u.username);
        const intersection = users1.filter((u: string) => users2.includes(u));
        expect(intersection).toHaveLength(0);
    });

    it("should return empty list for no matches", async () => {
        const response = await app.request("/profile/search?searchQuery=xyz_non_existent");
        expect(response.status).toBe(200);
        const json = await response.json() as any;

        expect(json.users).toHaveLength(0);
        expect(json.hasMore).toBe(false);
        expect(json.nextCursor).toBeNull();
    });

    it("should handle invalid cursor gracefully", async () => {
        const response = await app.request("/profile/search?searchQuery=e&cursor=invalid_cursor_string");
        expect(response.status).toBe(200);
        const json = await response.json() as any;

        expect(json.users.length).toBeGreaterThan(0);
    });

    it("should handle empty search query", async () => {
        const response = await app.request("/profile/search?searchQuery=");
        expect(response.status).toBe(200);
        const json = await response.json() as any;

        expect(Array.isArray(json.users)).toBe(true);
    });

    it("should handle missing search query parameter", async () => {
        const response = await app.request("/profile/search");
        expect(response.status).toBe(200);
        const json = await response.json() as any;

        expect(Array.isArray(json.users)).toBe(true);
    });

    it("should include joinedAt in ISO format", async () => {
        const response = await app.request("/profile/search?searchQuery=alice");
        expect(response.status).toBe(200);
        const json = await response.json() as any;

        expect(json.users[0].joinedAt).toBeDefined();
        const date = new Date(json.users[0].joinedAt);
        expect(date.toISOString()).toBe(json.users[0].joinedAt);
    });

    it("should include bio in response", async () => {
        const response = await app.request("/profile/search?searchQuery=alice");
        expect(response.status).toBe(200);
        const json = await response.json() as any;

        expect(json.users[0].bio).toBe("Loves heavy squats");
    });

    it("should handle users with null bio", async () => {
        const response = await app.request("/profile/search?searchQuery=eve");
        expect(response.status).toBe(200);
        const json = await response.json() as any;

        expect(json.users[0].username).toBe("eve_nobio");
        expect(json.users[0].bio).toBeNull();
    });

    it("should not match null bio when searching", async () => {
        const response = await app.request("/profile/search?searchQuery=null");
        expect(response.status).toBe(200);
        const json = await response.json() as any;

        const eveResult = json.users.find((u: any) => u.username === "eve_nobio");
        expect(eveResult).toBeUndefined();
    });

    it("should handle special characters in search query", async () => {
        const response = await app.request("/profile/search?searchQuery=@fitness");
        expect(response.status).toBe(200);
        const json = await response.json() as any;

        const frankResult = json.users.find((u: any) => u.username === "frank_special");
        expect(frankResult).toBeDefined();
    });

    it("should respect limit maximum of 20", async () => {
        const response = await app.request("/profile/search?searchQuery=e&limit=100");
        expect(response.status).toBe(200);
        const json = await response.json() as any;

        expect(json.users.length).toBeLessThanOrEqual(20);
    });

    it("should respect limit minimum of 1", async () => {
        const response = await app.request("/profile/search?searchQuery=e&limit=0");
        expect(response.status).toBe(200);
        const json = await response.json() as any;

        expect(json.users.length).toBeGreaterThan(0);
    });

    it("should handle negative limit gracefully", async () => {
        const response = await app.request("/profile/search?searchQuery=e&limit=-5");
        expect(response.status).toBe(200);
        const json = await response.json() as any;

        expect(json.users.length).toBeGreaterThan(0);
    });

    it("should handle non-numeric limit gracefully", async () => {
        const response = await app.request("/profile/search?searchQuery=e&limit=abc");
        expect(response.status).toBe(200);
        const json = await response.json() as any;

        expect(json.users.length).toBeGreaterThan(0);
    });

    it("should return hasMore false when no more results", async () => {
        const response = await app.request("/profile/search?searchQuery=alice&limit=20");
        expect(response.status).toBe(200);
        const json = await response.json() as any;

        expect(json.hasMore).toBe(false);
        expect(json.nextCursor).toBeNull();
    });

    it("should paginate through all results correctly", async () => {
        const allUsers: any[] = [];
        let cursor: string | null = null;
        let hasMore = true;

        while (hasMore) {
            const url = cursor
                ? `/profile/search?searchQuery=e&limit=2&cursor=${cursor}`
                : "/profile/search?searchQuery=e&limit=2";

            const response = await app.request(url);
            const json = await response.json() as any;

            allUsers.push(...json.users);
            hasMore = json.hasMore;
            cursor = json.nextCursor;

            if (hasMore) {
                expect(cursor).not.toBeNull();
            }
        }

        const uniqueUsernames = new Set(allUsers.map(u => u.username));
        expect(uniqueUsernames.size).toBe(allUsers.length);
    });

    it("should handle URL encoded search queries", async () => {
        const response = await app.request("/profile/search?searchQuery=alice%20lifter");
        expect(response.status).toBe(200);
        const json = await response.json() as any;

        expect(Array.isArray(json.users)).toBe(true);
    });

    it("should handle whitespace in search query", async () => {
        const response = await app.request("/profile/search?searchQuery=%20%20%20");
        expect(response.status).toBe(200);
        const json = await response.json() as any;

        expect(Array.isArray(json.users)).toBe(true);
    });

    it("should match partial username", async () => {
        const response = await app.request("/profile/search?searchQuery=ob_ru");
        expect(response.status).toBe(200);
        const json = await response.json() as any;

        expect(json.users.length).toBeGreaterThan(0);
        expect(json.users[0].username).toBe("bob_runner");
    });

    it("should handle malformed cursor (not base64)", async () => {
        const response = await app.request("/profile/search?searchQuery=e&cursor=@@@###$$$");
        expect(response.status).toBe(200);
        const json = await response.json() as any;

        expect(json.users).toBeDefined();
    });

    it("should handle cursor with invalid UUID", async () => {
        const invalidCursor = Buffer.from(JSON.stringify({ id: "not-a-uuid" })).toString('base64url');
        const response = await app.request(`/profile/search?searchQuery=e&cursor=${invalidCursor}`);
        expect(response.status).toBe(200);
        const json = await response.json() as any;

        expect(json.users).toBeDefined();
    });

    it("should match both username and bio for the same user", async () => {
        const response = await app.request("/profile/search?searchQuery=alice");
        expect(response.status).toBe(200);
        const json = await response.json() as any;

        expect(json.users.length).toBe(1);
        expect(json.users[0].username).toContain("alice");
    });
});

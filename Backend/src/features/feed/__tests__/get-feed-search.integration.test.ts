import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../../../createApp.js";
import { prisma } from "../../../../prisma/prismaConfig.js";

type PostSeed = {
    title: string;
    content: string;
    tags: string[];
};

const ALL_TAGS = [
    "Running", "Weights", "Fitness", "Nutrition", "Recovery",
    "Bodyweight", "Powerlifting", "Yoga", "HIIT", "Mobility",
    "Marathon", "Strength", "Cardio", "MealPrep", "Gains"
];

const postsData: PostSeed[] = [
    { title: "Just hit a 405 deadlift PR 🤯", content: "Been grinding conventional for 8 months. Finally locked out 405 for a triple. Form felt solid, no back rounding. Feeling unstoppable right now.", tags: ["Weights", "Powerlifting", "Gains"] },
    { title: "10k in 38:42 — new personal best", content: "Shaved 53 seconds off last month's time. Negative split the second half. Legs are toast but worth it.", tags: ["Running", "Cardio"] },
    { title: "Why I stopped cutting forever", content: "Reverse dieted out of my last cut and realized I perform better at 12-15% body fat year-round. No more zombie mode.", tags: ["Nutrition", "Fitness"] },
    { title: "Overhead press is finally moving", content: "Was stuck at 135x5 forever. Switched to 5/3/1 BBB and just hit 155x8. Volume is king.", tags: ["Weights", "Strength"] },
    { title: "Rest days aren't lazy", content: "Took 3 full days off this week and came back stronger. Recovery is part of the program.", tags: ["Recovery", "Fitness"] },
    { title: "Breakfast of champions", content: "500g Greek yogurt, blueberries, honey, and a scoop of whey. 70g protein before 9am.", tags: ["Nutrition", "MealPrep"] },
    { title: "Sub-20 5k achieved today", content: "19:38. Been chasing this for two years. Cried at the finish line ngl.", tags: ["Running", "Cardio"] },
    { title: "Zercher squats are brutal but effective", content: "Core and upper back on fire after 3x8 @ 275. Quads growing like crazy though.", tags: ["Weights", "Strength"] },
    { title: "Sleep > supplements", content: "Started prioritizing 8.5 hours and all my lifts shot up. No pre-workout beats real rest.", tags: ["Recovery", "Fitness"] },
    { title: "First unassisted muscle-up!", content: "Took 14 months of strict pull-ups and dip work. Finally strung 3 together today.", tags: ["Bodyweight", "Gains"] },
    { title: "Why I ditched the bro split", content: "Switched to full-body 4x/week. Recovery better, strength higher, less gym time. 10/10.", tags: ["Fitness", "Strength"] },
    { title: "Running in the rain hits different", content: "6 miles easy pace. Soaked but felt alive. Sometimes you just gotta embrace it.", tags: ["Running", "Cardio"] },
    { title: "Hit 315 bench for the first time", content: "Been stuck at 295 forever. Touch-and-go triple today. Let's goooo.", tags: ["Weights", "Powerlifting"] },
    { title: "Mobility work is non-negotiable", content: "10 min hip openers + thoracic work daily = zero pain and better squats. Do it.", tags: ["Mobility", "Recovery"] },
    { title: "150g protein shake recipe", content: "Skyr + milk + banana + peanut butter + oats. Tastes like dessert, hits macros.", tags: ["Nutrition", "Gains"] },
    { title: "Stopped weighing myself", content: "Progress pics and strength tell the real story. Scale was messing with my head.", tags: ["Fitness"] },
    { title: "First 2-hour half marathon training run", content: "Easy pace, felt strong the whole way. Marathon in 12 weeks. Let's do this.", tags: ["Running", "Marathon"] },
    { title: "Deficit deadlifts are no joke", content: "3 inches deficit @ 405x3. Hamstrings and grip screaming but posture stayed tight.", tags: ["Powerlifting", "Weights"] },
    { title: "Yoga for lifters changed everything", content: "30 min flow 2x/week = deeper squats, happier shoulders, better breathing under load.", tags: ["Yoga", "Mobility"] },
    { title: "Tracking macros without obsessing", content: "Hit protein, let carbs/fats float within 10%. Sustainable and still making gains.", tags: ["Nutrition"] },
    { title: "Paused squats fixed my depth", content: "2-second pause at bottom. First time ever hitting true depth with 315.", tags: ["Weights", "Strength"] },
    { title: "Cold showers post-workout", content: "Recovery feels faster, inflammation down, and I hate it less now 😂", tags: ["Recovery"] },
    { title: "10k steps even on leg day", content: "Active recovery matters. Blood flow > laying on the couch all day.", tags: ["Recovery", "Cardio"] },
    { title: "Front squats for quads on fire", content: "135x20 destroyed me in the best way. Walking like a cowboy today.", tags: ["Weights"] },
    { title: "Fasted cardio myth debunked (for me)", content: "Tried it for 8 weeks. Lost muscle, felt flat. Back to fed cardio and thriving.", tags: ["Cardio", "Nutrition"] },
    { title: "Pull-up PR: 20 strict", content: "Bodyweight only. Took 18 months of greasing the groove. Worth every rep.", tags: ["Bodyweight", "Gains"] },
    { title: "Deload week gratitude", content: "Body feels reborn. Never skipping deloads again.", tags: ["Recovery", "Fitness"] },
    { title: "Oatmeal > fancy breakfasts", content: "100g oats, whey, berries, cinnamon. Cheap, filling, 60g protein easy.", tags: ["Nutrition", "MealPrep"] },
    { title: "First marathon training block done", content: "70 mile week peaked. Legs held up. Taper starts now.", tags: ["Running", "Marathon"] },
    { title: "Block pulls for a thicker back", content: "495x5 from mid-shin. Lats are growing again.", tags: ["Powerlifting", "Weights"] },
    { title: "Stopped comparing my Chapter 3 to someone's Chapter 20", content: "Just hit my own PRs. That's enough.", tags: ["Fitness"] },
    { title: "HIIT sprints on the track", content: "10x200m all out. Puked after #8 but finished. Savage session.", tags: ["HIIT", "Cardio"] },
    { title: "Creatine loading done right", content: "5g 4x/day for a week → water weight up 6lbs → strength up 10-15% already.", tags: ["Gains", "Nutrition"] },
    { title: "Farmers carries for posture and grip", content: "100s in each hand for 50m x 5. Traps sore for days.", tags: ["Strength", "Bodyweight"] },
    { title: "Consistency beats intensity", content: "Showed up 4x/week for a year. That's the real secret.", tags: ["Fitness"] },
];

type TestUser = {
    id: string;
    username: string;
    email: string;
};

let testUsers: TestUser[] = [];

async function seedTestData(): Promise<void> {
    await prisma.$transaction(async (tx) => {
        await tx.postTag.deleteMany({});
        await tx.like.deleteMany({});
        await tx.favorite.deleteMany({});
        await tx.post.deleteMany({});
        await tx.user.deleteMany({});
        await tx.tag.deleteMany({});

        const tagMap = new Map<string, { id: number }>();
        for (const name of ALL_TAGS) {
            const tag = await tx.tag.create({
                data: { name },
            });
            tagMap.set(name, tag);
        }

        const createdUsers: TestUser[] = [];
        for (let i = 0; i < 3; i++) {
            const user = await tx.user.create({
                data: {
                    username: `testuser${i}`,
                    email: `testuser${i}@fitthreads.test`,
                    hashedPassword: "dummy_hashed_password",
                    bio: `Test user ${i} bio`,
                    emailVerified: true,
                    isAdmin: false,
                },
            });
            createdUsers.push({
                id: user.id,
                username: user.username,
                email: user.email,
            });
        }
        testUsers = createdUsers;

        for (const [index, post] of postsData.entries()) {
            const authorIndex = index % testUsers.length;
            const author = testUsers[authorIndex];

            const createdPost = await tx.post.create({
                data: {
                    title: post.title,
                    content: post.content,
                    authorId: author.id,
                    createdAt: new Date(Date.now() - index * 10000),
                },
            });

            if (post.tags.length > 0) {
                await tx.postTag.createMany({
                    data: post.tags.map(tagName => ({
                        postId: createdPost.id,
                        tagId: tagMap.get(tagName)!.id,
                    })),
                    skipDuplicates: true,
                });
            }
        }
    });

    const finalCount = await prisma.post.count();
    if (finalCount !== postsData.length) {
        throw new Error(`Seeding failed: expected ${postsData.length}, got ${finalCount}`);
    }
}

describe("GET /feed - Search Functionality", () => {
    let app: ReturnType<typeof createApp>;

    beforeAll(async () => {
        app = createApp();
    });

    beforeEach(async () => {
        await seedTestData();
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    describe("Search by title", () => {
        it("should find posts matching title search term", async () => {
            const response = await app.request("/feed?search=deadlift");
            expect(response.status).toBe(200);

            const json = await response.json() as any;
            expect(json.data.length).toBeGreaterThan(0);

            const titles = json.data.map((p: any) => p.title);
            expect(titles.some((title: string) => title.toLowerCase().includes("deadlift"))).toBe(true);
        });

        it("should find posts with 'bench' in title", async () => {
            const response = await app.request("/feed?search=bench");
            expect(response.status).toBe(200);

            const json = await response.json() as any;
            expect(json.data.length).toBeGreaterThan(0);

            const matchingPost = json.data.find((p: any) => p.title.includes("315 bench"));
            expect(matchingPost).toBeDefined();
        });

        it("should return empty array when no title matches", async () => {
            const response = await app.request("/feed?search=xyznonexistent123");
            expect(response.status).toBe(200);

            const json = await response.json() as any;
            expect(json.data).toEqual([]);
            expect(json.hasMore).toBe(false);
            expect(json.nextCursor).toBeNull();
        });
    });

    describe("Search by content", () => {
        it("should find posts matching content search term", async () => {
            const response = await app.request("/feed?search=conventional");
            expect(response.status).toBe(200);

            const json = await response.json() as any;
            expect(json.data.length).toBeGreaterThan(0);

            const matchingPost = json.data.find((p: any) =>
                p.content.toLowerCase().includes("conventional")
            );
            expect(matchingPost).toBeDefined();
        });

        it("should find posts with 'protein' in content", async () => {
            const response = await app.request("/feed?search=protein");
            expect(response.status).toBe(200);

            const json = await response.json() as any;
            expect(json.data.length).toBeGreaterThan(0);

            const hasProteinContent = json.data.some((p: any) =>
                p.content.toLowerCase().includes("protein")
            );
            expect(hasProteinContent).toBe(true);
        });

        it("should find posts with 'Greek yogurt' in content", async () => {
            const response = await app.request("/feed?search=Greek%20yogurt");
            expect(response.status).toBe(200);

            const json = await response.json() as any;
            expect(json.data.length).toBeGreaterThan(0);

            const matchingPost = json.data.find((p: any) =>
                p.content.includes("Greek yogurt")
            );
            expect(matchingPost).toBeDefined();
            expect(matchingPost.title).toBe("Breakfast of champions");
        });
    });

    describe("Search by username", () => {
        it("should find posts by specific username", async () => {
            const targetUser = testUsers[0];
            const response = await app.request(`/feed?search=${targetUser.username}`);
            expect(response.status).toBe(200);

            const json = await response.json() as any;
            expect(json.data.length).toBeGreaterThan(0);

            const allFromTargetUser = json.data.every((p: any) =>
                p.author.username === targetUser.username
            );
            expect(allFromTargetUser).toBe(true);
        });

        it("should find posts by testuser0", async () => {
            const response = await app.request("/feed?search=testuser0");
            expect(response.status).toBe(200);

            const json = await response.json() as any;
            expect(json.data.length).toBeGreaterThan(0);

            const allFromTestUser0 = json.data.every((p: any) =>
                p.author.username === "testuser0"
            );
            expect(allFromTestUser0).toBe(true);
        });
    });

    describe("Search by tags", () => {
        it("should find posts tagged with 'Powerlifting'", async () => {
            const response = await app.request("/feed?search=Powerlifting");
            expect(response.status).toBe(200);

            const json = await response.json() as any;
            expect(json.data.length).toBeGreaterThan(0);

            const hasPowerliftingTag = json.data.some((p: any) =>
                p.postTags.some((pt: any) => pt.tag.name === "Powerlifting")
            );
            expect(hasPowerliftingTag).toBe(true);
        });

        it("should find posts tagged with 'Running'", async () => {
            const response = await app.request("/feed?search=Running");
            expect(response.status).toBe(200);

            const json = await response.json() as any;
            expect(json.data.length).toBeGreaterThan(0);

            const hasRunningTag = json.data.some((p: any) =>
                p.postTags.some((pt: any) => pt.tag.name === "Running")
            );
            expect(hasRunningTag).toBe(true);
        });

        it("should find posts tagged with 'Nutrition'", async () => {
            const response = await app.request("/feed?search=Nutrition");
            expect(response.status).toBe(200);

            const json = await response.json() as any;
            expect(json.data.length).toBeGreaterThan(0);

            const hasNutritionTag = json.data.some((p: any) =>
                p.postTags.some((pt: any) => pt.tag.name === "Nutrition")
            );
            expect(hasNutritionTag).toBe(true);
        });
    });

    describe("Search with sortBy", () => {
        it("should search and sort by 'top' (likes count)", async () => {
            const response = await app.request("/feed?search=squat&sortBy=top");
            expect(response.status).toBe(200);

            const json = await response.json() as any;

            if (json.data.length > 1) {
                for (let i = 0; i < json.data.length - 1; i++) {
                    const currentLikes = json.data[i]._count.likes;
                    const nextLikes = json.data[i + 1]._count.likes;
                    expect(currentLikes).toBeGreaterThanOrEqual(nextLikes);
                }
            }
        });

        it("should search and sort by 'recent' (default)", async () => {
            const response = await app.request("/feed?search=fitness&sortBy=recent");
            expect(response.status).toBe(200);

            const json = await response.json() as any;

            if (json.data.length > 1) {
                for (let i = 0; i < json.data.length - 1; i++) {
                    const currentDate = new Date(json.data[i].createdAt);
                    const nextDate = new Date(json.data[i + 1].createdAt);
                    expect(currentDate.getTime()).toBeGreaterThanOrEqual(nextDate.getTime());
                }
            }
        });
    });

    describe("Search with pagination", () => {
        it("should paginate search results correctly", async () => {
            const response1 = await app.request("/feed?search=fitness&limit=5");
            expect(response1.status).toBe(200);

            const json1 = await response1.json() as any;
            expect(json1.data.length).toBeLessThanOrEqual(5);

            if (json1.hasMore && json1.nextCursor) {
                const response2 = await app.request(`/feed?search=fitness&limit=5&cursor=${json1.nextCursor}`);
                expect(response2.status).toBe(200);

                const json2 = await response2.json() as any;
                expect(json2.data.length).toBeGreaterThan(0);

                const firstPageIds = json1.data.map((p: any) => p.id);
                const secondPageIds = json2.data.map((p: any) => p.id);

                const hasOverlap = firstPageIds.some((id: string) => secondPageIds.includes(id));
                expect(hasOverlap).toBe(false);
            }
        });
    });

    describe("Search excludes admin posts", () => {
        it("should not return posts from admin users", async () => {
            await prisma.user.create({
                data: {
                    username: "admin_user",
                    email: "admin@fitthreads.test",
                    hashedPassword: "dummy",
                    isAdmin: true,
                    emailVerified: true,
                },
            });

            const adminUser = await prisma.user.findUnique({
                where: { username: "admin_user" },
            });

            await prisma.post.create({
                data: {
                    title: "Admin announcement about deadlifts",
                    content: "This is an admin post",
                    authorId: adminUser!.id,
                },
            });

            const response = await app.request("/feed?search=deadlift");
            expect(response.status).toBe(200);

            const json = await response.json() as any;
            const hasAdminPost = json.data.some((p: any) => p.author.username === "admin_user");
            expect(hasAdminPost).toBe(false);
        });
    });

    describe("Search excludes deleted posts", () => {
        it("should not return deleted posts in search results", async () => {
            const post = await prisma.post.findFirst({
                where: {
                    title: { contains: "deadlift" },
                },
            });

            if (post) {
                await prisma.post.update({
                    where: { id: post.id },
                    data: { deletedAt: new Date() },
                });

                const response = await app.request("/feed?search=deadlift");
                expect(response.status).toBe(200);

                const json = await response.json() as any;
                const hasDeletedPost = json.data.some((p: any) => p.id === post.id);
                expect(hasDeletedPost).toBe(false);
            }
        });
    });
});

describe("GET /feed - Username Filter", () => {
    let app: ReturnType<typeof createApp>;

    beforeAll(async () => {
        app = createApp();
    });

    beforeEach(async () => {
        await seedTestData();
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    describe("Filter by username", () => {
        it("should return only posts from specified user", async () => {
            const targetUser = testUsers[0];
            const response = await app.request(`/feed?username=${targetUser.username}`);
            expect(response.status).toBe(200);

            const json = await response.json() as any;
            expect(json.data.length).toBeGreaterThan(0);

            const allFromTargetUser = json.data.every((p: any) =>
                p.author.username === targetUser.username
            );
            expect(allFromTargetUser).toBe(true);
        });

        it("should return posts only from testuser1", async () => {
            const response = await app.request("/feed?username=testuser1");
            expect(response.status).toBe(200);

            const json = await response.json() as any;
            expect(json.data.length).toBeGreaterThan(0);

            const allFromTestUser1 = json.data.every((p: any) =>
                p.author.username === "testuser1"
            );
            expect(allFromTestUser1).toBe(true);

            const hasOtherUsers = json.data.some((p: any) =>
                p.author.username !== "testuser1"
            );
            expect(hasOtherUsers).toBe(false);
        });

        it("should return posts only from testuser2", async () => {
            const response = await app.request("/feed?username=testuser2");
            expect(response.status).toBe(200);

            const json = await response.json() as any;
            expect(json.data.length).toBeGreaterThan(0);

            const allFromTestUser2 = json.data.every((p: any) =>
                p.author.username === "testuser2"
            );
            expect(allFromTestUser2).toBe(true);
        });

        it("should return empty array for non-existent username", async () => {
            const response = await app.request("/feed?username=nonexistentuser999");
            expect(response.status).toBe(200);

            const json = await response.json() as any;
            expect(json.data).toEqual([]);
            expect(json.hasMore).toBe(false);
            expect(json.nextCursor).toBeNull();
        });
    });

    describe("Username filter with pagination", () => {
        it("should paginate user-specific posts correctly", async () => {
            const targetUser = testUsers[0];
            const response1 = await app.request(`/feed?username=${targetUser.username}&limit=5`);
            expect(response1.status).toBe(200);

            const json1 = await response1.json() as any;
            expect(json1.data.length).toBeGreaterThan(0);
            expect(json1.data.length).toBeLessThanOrEqual(5);

            const allFromTargetUser = json1.data.every((p: any) =>
                p.author.username === targetUser.username
            );
            expect(allFromTargetUser).toBe(true);

            if (json1.hasMore && json1.nextCursor) {
                const response2 = await app.request(
                    `/feed?username=${targetUser.username}&limit=5&cursor=${json1.nextCursor}`
                );
                expect(response2.status).toBe(200);

                const json2 = await response2.json() as any;
                expect(json2.data.length).toBeGreaterThan(0);

                const allFromTargetUserPage2 = json2.data.every((p: any) =>
                    p.author.username === targetUser.username
                );
                expect(allFromTargetUserPage2).toBe(true);

                const firstPageIds = json1.data.map((p: any) => p.id);
                const secondPageIds = json2.data.map((p: any) => p.id);

                const hasOverlap = firstPageIds.some((id: string) => secondPageIds.includes(id));
                expect(hasOverlap).toBe(false);
            }
        });
    });

    describe("Username filter excludes admin posts", () => {
        it("should not return posts if user is admin", async () => {
            await prisma.user.create({
                data: {
                    username: "admin_with_posts",
                    email: "adminposts@fitthreads.test",
                    hashedPassword: "dummy",
                    isAdmin: true,
                    emailVerified: true,
                },
            });

            const adminUser = await prisma.user.findUnique({
                where: { username: "admin_with_posts" },
            });

            await prisma.post.create({
                data: {
                    title: "Admin post",
                    content: "Admin content",
                    authorId: adminUser!.id,
                },
            });

            const response = await app.request("/feed?username=admin_with_posts");
            expect(response.status).toBe(200);

            const json = await response.json() as any;
            expect(json.data).toEqual([]);
        });
    });

    describe("Username filter excludes deleted posts", () => {
        it("should not return deleted posts for user", async () => {
            const targetUser = testUsers[0];

            const userPost = await prisma.post.findFirst({
                where: {
                    author: { username: targetUser.username },
                },
            });

            if (userPost) {
                await prisma.post.update({
                    where: { id: userPost.id },
                    data: { deletedAt: new Date() },
                });

                const response = await app.request(`/feed?username=${targetUser.username}`);
                expect(response.status).toBe(200);

                const json = await response.json() as any;
                const hasDeletedPost = json.data.some((p: any) => p.id === userPost.id);
                expect(hasDeletedPost).toBe(false);
            }
        });
    });
});

import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../../../createApp.js";
import { prisma } from "../../../../prisma/prismaConfig.js";

type PostSeed = {
    title: string;
    content: string;
    tags: string[];
};

const dummyPosts: PostSeed[] = [
    { title: "Just hit a 405 deadlift PR", content: "...", tags: ["Weights", "Powerlifting", "Gains"] },
    { title: "10k in 38:42 — new personal best", content: "...", tags: ["Running", "Cardio"] },
    { title: "Why I stopped cutting forever", content: "...", tags: ["Nutrition", "Fitness"] },
    { title: "Overhead press is finally moving", content: "...", tags: ["Weights", "Strength"] },
    { title: "Rest days aren’t lazy", content: "...", tags: ["Recovery", "Fitness"] },
    { title: "Breakfast of champions", content: "...", tags: ["Nutrition", "MealPrep"] },
    { title: "Sub-20 5k achieved today", content: "...", tags: ["Running", "Cardio"] },
    { title: "Zercher squats are brutal but effective", content: "...", tags: ["Weights", "Strength"] },
    { title: "Sleep > supplements", content: "...", tags: ["Recovery", "Fitness"] },
    { title: "First unassisted muscle-up!", content: "...", tags: ["Bodyweight", "Gains"] },
    { title: "Why I ditched the bro split", content: "...", tags: ["Fitness", "Strength"] },
    { title: "Running in the rain hits different", content: "...", tags: ["Running", "Cardio"] },
    { title: "Hit 315 bench for the first time", content: "...", tags: ["Weights", "Powerlifting"] },
    { title: "Mobility work is non-negotiable", content: "...", tags: ["Mobility", "Recovery"] },
    { title: "150g protein shake recipe", content: "...", tags: ["Nutrition", "Gains"] },
    { title: "Stopped weighing myself", content: "...", tags: ["Fitness"] },
    { title: "First 2-hour half marathon training run", content: "...", tags: ["Running", "Marathon"] },
    { title: "Deficit deadlifts are no joke", content: "...", tags: ["Powerlifting", "Weights"] },
    { title: "Yoga for lifters changed everything", content: "...", tags: ["Yoga", "Mobility"] },
    { title: "Tracking macros without obsessing", content: "...", tags: ["Nutrition"] },
    { title: "Paused squats fixed my depth", content: "...", tags: ["Weights", "Strength"] },
    { title: "Cold showers post-workout", content: "...", tags: ["Recovery"] },
    { title: "10k steps even on leg day", content: "...", tags: ["Recovery", "Cardio"] },
    { title: "Front squats for quads on fire", content: "...", tags: ["Weights"] },
    { title: "Fasted cardio myth debunked (for me)", content: "...", tags: ["Cardio", "Nutrition"] },
    { title: "Pull-up PR: 20 strict", content: "...", tags: ["Bodyweight", "Gains"] },
    { title: "Deload week gratitude", content: "...", tags: ["Recovery", "Fitness"] },
    { title: "Oatmeal > fancy breakfasts", content: "...", tags: ["Nutrition", "MealPrep"] },
    { title: "First marathon training block done", content: "...", tags: ["Running", "Marathon"] },
    { title: "Block pulls for a thicker back", content: "...", tags: ["Powerlifting", "Weights"] },
    { title: "Stopped comparing my Chapter 3 to someone’s Chapter 20", content: "...", tags: ["Fitness"] },
    { title: "HIIT sprints on the track", content: "...", tags: ["HIIT", "Cardio"] },
    { title: "Creatine loading done right", content: "...", tags: ["Gains", "Nutrition"] },
    { title: "Farmers carries for posture and grip", content: "...", tags: ["Strength", "Bodyweight"] },
    { title: "Consistency beats intensity 🔥", content: "...", tags: ["Fitness"] }, // ← unique
];

const SEED_USER = {
    username: "integration_test_user",
    email: "test@fitthreads.dev",
    hashedPassword: "dummy_hash",
    bio: "Test runner - not a real human",
};

const ALL_TAGS = [
    "Running", "Weights", "Fitness", "Nutrition", "Recovery",
    "Bodyweight", "Powerlifting", "Yoga", "HIIT", "Mobility",
    "Marathon", "Strength", "Cardio", "MealPrep", "Gains"
];

async function seedTestData() {
    await prisma.$transaction(async (tx) => {
        await tx.postTag.deleteMany({});
        await tx.like.deleteMany({});
        await tx.favorite.deleteMany({});
        await tx.post.deleteMany({});
        await tx.user.deleteMany({});
        await tx.tag.deleteMany({});

        const user = await tx.user.create({
            data: {
                username: SEED_USER.username,
                email: SEED_USER.email,
                hashedPassword: SEED_USER.hashedPassword,
                bio: SEED_USER.bio,
            },
        });

        const tagMap = new Map<string, { id: number }>();
        for (const name of ALL_TAGS) {
            const tag = await tx.tag.upsert({
                where: { name },
                update: {},
                create: { name },
            });
            tagMap.set(name, tag);
        }

        for (const [index, post] of dummyPosts.entries()) {
            const createdAt = new Date(Date.now() - index * 10000);

            const createdPost = await tx.post.create({
                data: {
                    title: post.title,
                    content: post.content,
                    authorId: user.id,
                    createdAt,
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
    console.log("Actually seeded posts:", finalCount);
    if (finalCount !== dummyPosts.length) {
        throw new Error(`Seeding failed: expected ${dummyPosts.length}, got ${finalCount}`);
    }
}


describe("GET /feed - Public Feed with Cursor Pagination", () => {
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

    it("paginates the entire feed correctly (20 → 15 → 0)", async () => {
        const totalPosts = await prisma.post.count();
        expect(totalPosts).toBe(35);

        const page1 = await app.request("/feed?limit=20");
        expect(page1.status).toBe(200);
        const res1 = await page1.json() as any

        expect(res1.data).toHaveLength(20);
        expect(res1.hasMore).toBe(true);
        expect(res1.nextCursor).toBeDefined();

        const page2 = await app.request(`/feed?cursor=${res1.nextCursor}&limit=20`);
        const res2 = await page2.json() as any

        expect(res2.data).toHaveLength(15);
        expect(res2.hasMore).toBe(false);
        expect(res2.nextCursor).toBeNull();
    });

    it("returns first 20 posts when no cursor", async () => {
        const res = await app.request("/feed");
        const json = await res.json() as any
        expect(json.data).toHaveLength(20);
        expect(json.hasMore).toBe(true);
    });

    it("handles invalid cursor → returns first page", async () => {
        const res = await app.request("/feed?cursor=garbage-lol-hi-mom");
        expect(res.status).toBe(200);
        const json = await res.json() as any
        expect(json.data).toHaveLength(20);
    });
});

import { prisma } from "../prismaConfig.js";
import { faker } from "@faker-js/faker";

async function main() {
    console.log("🚀 Starting FitThreads mega-seed...");

    // 1. Seed user (admin)
    const seedUser = await prisma.user.upsert({
        where: { email: "seed_user@fitthreads.com" },
        update: {},
        create: {
            username: "seed_user",
            email: "seed_user@fitthreads.com",
            hashedPassword: "dummy_hashed_password",
            bio: "Built this place with sweat and code 💪",
            isAdmin: true,
            emailVerified: true
        },
    });

    // 2. Upsert core tags
    const tagNames = [
        "Running", "Weights", "Fitness", "Nutrition", "Recovery",
        "Bodyweight", "Powerlifting", "Yoga", "HIIT", "Mobility",
        "Marathon", "Strength", "Cardio", "MealPrep", "Gains"
    ];

    const tags: any = [];
    for (const name of tagNames) {
        const tag = await prisma.tag.upsert({
            where: { name },
            update: {},
            create: { name },
        });
        tags.push(tag);
    }

    // 3. Clean old posts from seed user
    await prisma.post.deleteMany({ where: { authorId: seedUser.id } });
    await prisma.like.deleteMany({ where: { userId: seedUser.id } });
    await prisma.favorite.deleteMany({ where: { userId: seedUser.id } });

    // 4. Create 20 fake users who will like/favorite posts
    const fakeUsers = [];
    for (let i = 0; i < 20; i++) {
        const user = await prisma.user.create({
            data: {
                username: faker.internet.username().toLowerCase().replace(/[^a-z0-9_]/g, ""),
                email: faker.internet.email(),
                hashedPassword: "fake_hashed_" + faker.string.uuid(),
                bio: faker.person.bio(),
                emailVerified: true,
                isAdmin: false,
            },
        });
        fakeUsers.push(user);
    }

    // 5. 35 realistic fitness posts
    const postsData = [
        { title: "Just hit a 405 deadlift PR 🤯", content: "Been grinding conventional for 8 months. Finally locked out 405 for a triple. Form felt solid, no back rounding. Feeling unstoppable right now.", tags: ["Weights", "Powerlifting", "Gains"] },
        { title: "10k in 38:42 — new personal best", content: "Shaved 53 seconds off last month’s time. Negative split the second half. Legs are toast but worth it.", tags: ["Running", "Cardio"] },
        { title: "Why I stopped cutting forever", content: "Reverse dieted out of my last cut and realized I perform better at 12-15% body fat year-round. No more zombie mode.", tags: ["Nutrition", "Fitness"] },
        { title: "Overhead press is finally moving", content: "Was stuck at 135x5 forever. Switched to 5/3/1 BBB and just hit 155x8. Volume is king.", tags: ["Weights", "Strength"] },
        { title: "Rest days aren’t lazy", content: "Took 3 full days off this week and came back stronger. Recovery is part of the program.", tags: ["Recovery", "Fitness"] },
        { title: "Breakfast of champions", content: "500g Greek yogurt, blueberries, honey, and a scoop of whey. 70g protein before 9am.", tags: ["Nutrition", "MealPrep"] },
        { title: "Sub-20 5k achieved today", content: "19:38. Been chasing this for two years. Cried at the finish line ngl.", tags: ["Running", "Cardio"] },
        { title: "Zercher squats are brutal but effective", content: "Core and upper back on fire after 3x8 @ 275. Quads growing like crazy though.", tags: ["Weights", "Strength"] },
        { title: "Sleep > supplements", content: "Started prioritizing 8.5 hours and all my lifts shot up. No pre-workout beats real rest.", tags: ["Recovery", "Fitness"] },
        { title: "First unassisted muscle-up!", content: "Took 14 months of strict pull-ups and dip work. Finally strung 3 together today.", tags: ["Bodyweight", "Gains"] },
        { title: "Why I ditched the bro split", content: "Switched to full-body 4x/week. Recovery better, strength higher, less gym time. 10/10.", tags: ["Fitness", "Strength"] },
        { title: "Running in the rain hits different", content: "6 miles easy pace. Soaked but felt alive. Sometimes you just gotta embrace it.", tags: ["Running", "Cardio"] },
        { title: "Hit 315 bench for the first time", content: "Been stuck at 295 forever. Touch-and-go triple today. Let’s goooo.", tags: ["Weights", "Powerlifting"] },
        { title: "Mobility work is non-negotiable", content: "10 min hip openers + thoracic work daily = zero pain and better squats. Do it.", tags: ["Mobility", "Recovery"] },
        { title: "150g protein shake recipe", content: "Skyr + milk + banana + peanut butter + oats. Tastes like dessert, hits macros.", tags: ["Nutrition", "Gains"] },
        { title: "Stopped weighing myself", content: "Progress pics and strength tell the real story. Scale was messing with my head.", tags: ["Fitness"] },
        { title: "First 2-hour half marathon training run", content: "Easy pace, felt strong the whole way. Marathon in 12 weeks. Let’s do this.", tags: ["Running", "Marathon"] },
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
        { title: "Stopped comparing my Chapter 3 to someone’s Chapter 20", content: "Just hit my own PRs. That’s enough.", tags: ["Fitness"] },
        { title: "HIIT sprints on the track", content: "10x200m all out. Puked after #8 but finished. Savage session.", tags: ["HIIT", "Cardio"] },
        { title: "Creatine loading done right", content: "5g 4x/day for a week → water weight up 6lbs → strength up 10-15% already.", tags: ["Gains", "Nutrition"] },
        { title: "Farmers carries for posture and grip", content: "100s in each hand for 50m x 5. Traps sore for days.", tags: ["Strength", "Bodyweight"] },
        { title: "Consistency beats intensity", content: "Showed up 4x/week for a year. That’s the real secret.", tags: ["Fitness"] },
    ];

    // 6. Create posts + assign likes & favorites
    for (const data of postsData) {
        const selectedTags = data.tags.map((t: any) => tags.find((tag: any) => tag.name === t)!);

        const post = await prisma.post.create({
            data: {
                title: data.title,
                content: data.content,
                authorId: faker.helpers.arrayElement(fakeUsers).id,
                postTags: {
                    create: selectedTags.map(tag => ({
                        tag: { connect: { id: tag.id } },
                    })),
                },
            },
        });

        console.log(`Created: "${post.title}"`);

        // Exactly 20 likes
        const likers = faker.helpers.shuffle(fakeUsers).slice(0, 20);
        for (const liker of likers) {
            await prisma.like.create({
                data: { userId: liker.id, postId: post.id },
            });
        }

        // Exactly 10 favorites (from first 10 of shuffled likers)
        const favoriters = likers.slice(0, 10);
        for (const fav of favoriters) {
            await prisma.favorite.create({
                data: { userId: fav.id, postId: post.id },
            });
        }
    }

    console.log("✅ Seeding complete! 35 posts • 700 likes • 350 favorites • real vibes only.");
}

main()
    .then(async () => await prisma.$disconnect())
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
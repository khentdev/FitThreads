import { prisma } from "../prismaConfig.js";
import bcrypt from "bcrypt";

/**
 * Production seed - runs ONCE to populate initial data for MVP launch
 * Idempotent: checks if admin exists before seeding
 */
async function seedProduction() {
    console.log("Checking production seed status...");

    try {
        console.log("Querying for admin user: khentplays@gmail.com");
        const adminExists = await prisma.user.findUnique({
            where: { email: "khentplays@gmail.com" },
        });

        console.log(`Admin exists check result: ${adminExists ? 'FOUND' : 'NOT FOUND'}`);

        if (adminExists) {
            console.log("Production seed already executed. Skipping.");
            return;
        }

        console.log("Starting production seed...");
    } catch (error) {
        console.error("Error checking admin user:", error);
        throw error;
    }

    const hashedPassword = await bcrypt.hash("secure_admin_password_change_me", 10);
    const admin = await prisma.user.create({
        data: {
            username: "khent_admin",
            email: "khentplays@gmail.com",
            hashedPassword,
            bio: "Built this place with sweat and code.",
            isAdmin: true,
            emailVerified: true,
            emailVerifiedAt: new Date(),
        },
    });
    console.log(`Admin user created: ${admin.username}`);

    const tagNames = [
        "Running",
        "Weights",
        "Fitness",
        "Nutrition",
        "Recovery",
        "Bodyweight",
        "Powerlifting",
        "Yoga",
        "HIIT",
        "Mobility",
        "Marathon",
        "Strength",
        "Cardio",
        "MealPrep",
        "Gains",
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
    console.log(`Created ${tags.length} tags`);

    const usernames = [
        "MikeLIFTS",
        "sarah_runs22",
        "CoachDave",
        "jenny.gains",
        "cardio_alex",
        "TomStrong",
        "lisa_yoga",
        "markPR",
        "EmmaFit21",
        "jake.iron",
        "nina_health",
        "chrispwr",
        "amy_active",
        "BenBEAST",
        "kate.endure",
        "ryanripped",
        "olivia_moves",
        "sam.shredded",
        "LucyLean",
        "MaxMuscle",
        "sophie.sprint",
        "tyler_trains",
        "grace.grind",
        "noah_natty",
        "ella.elite",
        "JoshJACKED",
        "mia_motiv8",
        "liamlifts",
        "zoe.zen",
        "eric_effort",
        "hannah.hustle",
        "owen.opt",
        "chloe_crush",
        "adam_athlete",
        "ruby.runner",
        "derek_diesel",
        "fiona.flex",
        "carlos.cali",
        "megan_moves",
        "brandon.bulk",
        "tara.beast",
        "joey_jacked",
        "sam.shred",
        "marcus.mass",
        "kylie_kb",
        "austin_abs",
        "natalie_nat",
        "trent.train",
        "rachel_reps",
        "dylan.dips",
    ];

    const bios = [
        "Deadlifts and coffee",
        "Chasing PRs since 2022",
        "Runner | Plant-based | Always hungry",
        "just here to lift heavy things",
        "Yoga teacher | Mobility nerd",
        "marathon training never stops",
        "Powerlifter | 500lb club",
        "bodyweight warrior",
        "HIIT junkie | cardio lover",
        "Strength coach | Science-based training",
        "5AM CREW | early bird gains",
        "Calisthenics | Handstand practice daily",
        "Meal prep Sunday champion",
        "former couch potato turned runner",
        "Lifting since 2019 | Still learning",
        "gym rat | protein enthusiast",
        "Functional fitness advocate",
        "CrossFit dropout now freelifting",
        "Recovery IS training too",
        "Track athlete | Speed work obsessed",
        "kettlebell certified | swing life",
        "Olympic lifting journey",
        "Mind over matter. Always.",
        "fitness is my therapy",
        "Pushing limits daily",
        "FORM > EGO every time",
        "Consistency beats intensity",
        "Just trying to get 1% better",
        "strength sports enthusiast",
        "Running changed my life",
        "Home gym hero",
        "Nutrition student | Macro tracker",
        "climbing + lifting combo",
        "Health first mindset",
        "always competing with yesterday",
        "Pull-ups are my love language",
        "Ring muscle-up progress",
        "Bulking season year-round",
        "Minimalist training maximalist results",
        "Planche training | still can't do it yet",
        "Front lever gains incoming",
        "Weighted calisthenics obsessed",
        "Bar athlete | street workout vibes",
        "Progressive overload believer",
        "Compound movements only",
        "No rest days just active recovery",
        "Training for life not Instagram",
        "Mobility Monday through Sunday",
        "Handstand walks > treadmill walks",
        "L-sit practice daily",
    ];

    const users: any = [];
    const defaultPassword = await bcrypt.hash("temp_password_123", 10);

    for (let i = 0; i < usernames.length; i++) {
        const user = await prisma.user.create({
            data: {
                username: usernames[i],
                email: `${usernames[i].replace(/[._]/g, "")}@fitthreads.example`,
                hashedPassword: defaultPassword,
                bio: bios[i],
                emailVerified: true,
                emailVerifiedAt: new Date(),
            },
        });
        users.push(user);
    }
    console.log(`Created ${users.length} users`);


    const userPostMap = [
        {
            username: "MikeLIFTS",
            posts: [
                {
                    title: "hit 405 deadlift today",
                    content: "been chasing this for 8 months. finally locked out 405x3. form felt perfect, no back rounding. feeling unstoppable rn",
                    tags: ["Weights", "Powerlifting", "Gains"],
                },
                {
                    title: "deficit deads are no joke",
                    content: "3 inch deficit at 405x3. hamstrings and grip screaming but posture stayed tight throughout",
                    tags: ["Powerlifting", "Weights"],
                },
            ]
        },
        {
            username: "sarah_runs22",
            posts: [
                {
                    title: "10k pb 38:42",
                    content: "shaved 53 seconds off last months time. negative split the second half. legs destroyed but so worth it",
                    tags: ["Running", "Cardio"],
                },
                {
                    title: "running in the rain hits different",
                    content: "6 miles easy pace. completely soaked but felt so alive. sometimes you just gotta embrace it",
                    tags: ["Running", "Cardio"],
                },
                {
                    title: "first 2 hour training run",
                    content: "easy pace, felt strong the entire way. marathon in 12 weeks here we go",
                    tags: ["Running", "Marathon"],
                },
            ]
        },
        {
            username: "CoachDave",
            posts: [
                {
                    title: "ditched the bro split",
                    content: "switched to full body 4x a week. recovery is better, strength is higher, less time in the gym. literally 10/10",
                    tags: ["Fitness", "Strength"],
                },
                {
                    title: "ohp finally moving again",
                    content: "stuck at 135x5 forever. switched to 5/3/1 bbb and just hit 155x8. volume is definitely king",
                    tags: ["Weights", "Strength"],
                },
            ]
        },
        {
            username: "jenny.gains",
            posts: [
                {
                    title: "315 bench finally",
                    content: "been stuck at 295 forever. touch and go triple today. LETS GOOOOO",
                    tags: ["Weights", "Powerlifting"],
                },
                {
                    title: "paused squats fixed my depth",
                    content: "2 second pause at the bottom. first time ever hitting true depth with 315 on my back",
                    tags: ["Weights", "Strength"],
                },
            ]
        },
        {
            username: "cardio_alex",
            posts: [
                {
                    title: "hiit sprints on the track",
                    content: "10x200m all out effort. puked after number 8 but finished all 10. absolutely savage session",
                    tags: ["HIIT", "Cardio"],
                },
                {
                    title: "hill sprints humble you fast",
                    content: "8x30 second all out sprints up a steep hill. cardio and legs absolutely demolished. 10/10 recommend",
                    tags: ["HIIT", "Cardio", "Running"],
                },
            ]
        },
        {
            username: "TomStrong",
            posts: [
                {
                    title: "sumo deadlift converted me",
                    content: "conventional hurt my lower back. switched to sumo, pulling more weight pain free. shouldve done this years ago",
                    tags: ["Powerlifting", "Weights"],
                },
                {
                    title: "zercher squats are brutal",
                    content: "core and upper back on fire after 3x8 at 275. quads growing like crazy tho so cant complain",
                    tags: ["Weights", "Strength"],
                },
            ]
        },
        {
            username: "lisa_yoga",
            posts: [
                {
                    title: "yoga for lifters changed everything",
                    content: "30 min flow twice a week equals deeper squats, happier shoulders, better breathing under heavy load",
                    tags: ["Yoga", "Mobility"],
                },
                {
                    title: "mobility work is non negotiable",
                    content: "10 min hip openers plus thoracic work daily equals zero pain and better squat depth. just do it",
                    tags: ["Mobility", "Recovery"],
                },
            ]
        },
        {
            username: "markPR",
            posts: [
                {
                    title: "front squats for quad gains",
                    content: "135x20 destroyed me in the absolute best way. walking like a cowboy today",
                    tags: ["Weights"],
                },
                {
                    title: "belt squats saved my back",
                    content: "spine issues meant no barbell squats. belt squat machine has my quads growing better than ever",
                    tags: ["Weights", "Strength"],
                },
            ]
        },
        {
            username: "EmmaFit21",
            posts: [
                {
                    title: "sub 20 minute 5k done",
                    content: "19:38. been chasing this for two whole years. literally cried at the finish line ngl",
                    tags: ["Running", "Cardio"],
                },
                {
                    title: "stopped comparing myself",
                    content: "just hit my own prs and celebrate my own progress. thats literally enough",
                    tags: ["Fitness"],
                },
            ]
        },
        {
            username: "jake.iron",
            posts: [
                {
                    title: "first unassisted muscle up",
                    content: "took 14 months of strict pullups and dip work but finally strung 3 together today. feeling elite",
                    tags: ["Bodyweight", "Gains"],
                },
                {
                    title: "pullup pr 20 strict reps",
                    content: "bodyweight only. took 18 months of greasing the groove daily. worth every single rep",
                    tags: ["Bodyweight", "Gains"],
                },
                {
                    title: "ring dips progression complete",
                    content: "started with bands 4 months ago. today hit 3x10 strict. shoulders feel bulletproof",
                    tags: ["Bodyweight", "Strength"],
                },
            ]
        },
        {
            username: "nina_health",
            posts: [
                {
                    title: "tracking macros without obsessing",
                    content: "hit protein target, let carbs and fats float within 10%. still making gains and its way more sustainable",
                    tags: ["Nutrition"],
                },
                {
                    title: "protein timing doesnt matter",
                    content: "hit 180g daily, dont stress the window. gains are exactly the same and way less stressful",
                    tags: ["Nutrition"],
                },
            ]
        },
        {
            username: "chrispwr",
            posts: [
                {
                    title: "150g protein shake recipe",
                    content: "skyr, milk, banana, peanut butter, oats. tastes like actual dessert and hits all your macros perfectly",
                    tags: ["Nutrition", "Gains"],
                },
                {
                    title: "block pulls for thicker back",
                    content: "495x5 from mid shin. lats are finally growing again after plateau",
                    tags: ["Powerlifting", "Weights"],
                },
            ]
        },
        {
            username: "amy_active",
            posts: [
                {
                    title: "breakfast of champions",
                    content: "500g greek yogurt, blueberries, honey, scoop of whey. 70g protein before 9am. this is the way",
                    tags: ["Nutrition", "MealPrep"],
                },
                {
                    title: "oatmeal over fancy breakfasts",
                    content: "100g oats, whey protein, berries, cinnamon. cheap, filling, easy 60g protein",
                    tags: ["Nutrition", "MealPrep"],
                },
            ]
        },
        {
            username: "BenBEAST",
            posts: [
                {
                    title: "morning cardio routine locked in",
                    content: "20 min walk before breakfast every single day. simple but changed my entire body composition",
                    tags: ["Cardio", "Recovery"],
                },
                {
                    title: "creatine loading done right",
                    content: "5g four times daily for a week. water weight up 6lbs, strength already up 10-15 percent",
                    tags: ["Gains", "Nutrition"],
                },
            ]
        },
        {
            username: "kate.endure",
            posts: [
                {
                    title: "half marathon under 90 minutes",
                    content: "89:12 finish. everything clicked today. pacing, nutrition, mental game all perfect",
                    tags: ["Running", "Marathon"],
                },
                {
                    title: "first marathon training block done",
                    content: "peaked at 70 mile week. legs held up perfectly. taper starts now lets get it",
                    tags: ["Running", "Marathon"],
                },
            ]
        },
        {
            username: "ryanripped",
            posts: [
                {
                    title: "why i stopped cutting forever",
                    content: "reverse dieted out of my last cut and realized i perform way better at 12-15% body fat year round. no more zombie mode for me",
                    tags: ["Nutrition", "Fitness"],
                },
                {
                    title: "incline bench over flat",
                    content: "made incline my main press. upper chest finally caught up to my lower chest. balance looks way better",
                    tags: ["Weights", "Strength"],
                },
            ]
        },
        {
            username: "olivia_moves",
            posts: [
                {
                    title: "first handstand hold 30 seconds",
                    content: "been doing wall work for 6 months. finally kicked up freestanding and held it. best feeling ever",
                    tags: ["Bodyweight", "Gains"],
                },
            ]
        },
        {
            username: "sam.shredded",
            posts: [
                {
                    title: "rest days are not lazy days",
                    content: "took 3 full days off this week and came back stronger than ever. recovery is literally part of the program people",
                    tags: ["Recovery", "Fitness"],
                },
                {
                    title: "sleep beats supplements",
                    content: "started prioritizing 8.5 hours every night and all my lifts shot up. no pre workout beats actual rest",
                    tags: ["Recovery", "Fitness"],
                },
            ]
        },
        {
            username: "LucyLean",
            posts: [
                {
                    title: "carb cycling actually works",
                    content: "high carbs on training days, moderate on rest. leaning out while maintaining all my strength",
                    tags: ["Nutrition", "Fitness"],
                },
            ]
        },
        {
            username: "MaxMuscle",
            posts: [
                {
                    title: "farmers carries for everything",
                    content: "100lb dumbbells each hand for 50m times 5 sets. traps sore for literal days",
                    tags: ["Strength", "Bodyweight"],
                },
            ]
        },
        {
            username: "sophie.sprint",
            posts: [
                {
                    title: "fasted cardio myth debunked for me",
                    content: "tried it for 8 weeks straight. lost muscle, felt flat all the time. back to fed cardio and thriving now",
                    tags: ["Cardio", "Nutrition"],
                },
            ]
        },
        {
            username: "tyler_trains",
            posts: [
                {
                    title: "consistency beats intensity always",
                    content: "showed up 4 times a week for an entire year. thats the actual real secret nobody wants to hear",
                    tags: ["Fitness"],
                },
            ]
        },
        {
            username: "grace.grind",
            posts: [
                {
                    title: "deload week appreciation post",
                    content: "body feels completely reborn. never ever skipping deloads again",
                    tags: ["Recovery", "Fitness"],
                },
            ]
        },
        {
            username: "noah_natty",
            posts: [
                {
                    title: "bodyweight program results",
                    content: "3 months of only pushups pullups dips squats. gained muscle, lost fat, saved money. home training works",
                    tags: ["Bodyweight", "Fitness"],
                },
            ]
        },
        {
            username: "ella.elite",
            posts: [
                {
                    title: "tempo training revelation",
                    content: "3 second negative on bench. dropped weight 20 percent but chest growth is insane",
                    tags: ["Weights", "Strength"],
                },
            ]
        },
        {
            username: "JoshJACKED",
            posts: [
                {
                    title: "pre workout is overrated",
                    content: "switched to black coffee and a banana. same energy, no crash, no weird tingles. never going back",
                    tags: ["Nutrition", "Fitness"],
                },
            ]
        },
        {
            username: "mia_motiv8",
            posts: [
                {
                    title: "stopped weighing myself",
                    content: "progress pics and strength numbers tell the real story. the scale was just messing with my head tbh",
                    tags: ["Fitness"],
                },
            ]
        },
        {
            username: "liamlifts",
            posts: [
                {
                    title: "meal timing flexibility ftw",
                    content: "stopped forcing breakfast. first meal at noon, last at 8pm. finally sustainable for my lifestyle",
                    tags: ["Nutrition", "Fitness"],
                },
            ]
        },
        {
            username: "zoe.zen",
            posts: [
                {
                    title: "foam rolling daily habit now",
                    content: "15 minutes before bed every night. sleep better, recover faster, move better. absolute game changer",
                    tags: ["Recovery", "Mobility"],
                },
            ]
        },
        {
            username: "eric_effort",
            posts: [
                {
                    title: "10k steps even on leg day",
                    content: "active recovery actually matters. blood flow is way better than just laying on the couch all day",
                    tags: ["Recovery", "Cardio"],
                },
            ]
        },
        {
            username: "hannah.hustle",
            posts: [
                {
                    title: "cold showers post workout",
                    content: "recovery feels faster, inflammation is down, and i hate it less now lol",
                    tags: ["Recovery"],
                },
            ]
        },
    ];

    const allPosts = userPostMap.flatMap(userPost =>
        userPost.posts.map(post => ({
            username: userPost.username,
            ...post
        }))
    );

    const shuffledPosts = allPosts.sort(() => Math.random() - 0.5);

    let postCount = 0;
    for (const postData of shuffledPosts) {
        const author = users.find((u: any) => u.username === postData.username);
        if (!author) continue;

        const selectedTags = postData.tags
            .map((tagName) => tags.find((t: any) => t.name === tagName))
            .filter((t: any) => t !== undefined);

        const post = await prisma.post.create({
            data: {
                title: postData.title,
                content: postData.content,
                authorId: author.id,
                postTags: {
                    create: selectedTags.map((tag) => ({
                        tag: { connect: { id: tag.id } },
                    })),
                },
            },
        });

        const likeCount = Math.floor(Math.random() * 11) + 15;
        const shuffledUsers = [...users].sort(() => Math.random() - 0.5);
        const likers = shuffledUsers.slice(0, Math.min(likeCount, users.length));

        for (const liker of likers) {
            await prisma.like.create({
                data: {
                    userId: liker.id,
                    postId: post.id,
                },
            });
        }

        const favCount = Math.floor(Math.random() * 8) + 5;
        const favoriters = likers.slice(0, Math.min(favCount, likers.length));

        for (const fav of favoriters) {
            await prisma.favorite.create({
                data: {
                    userId: fav.id,
                    postId: post.id,
                },
            });
        }

        postCount++;
    }

    console.log(`Created ${postCount} posts with realistic user-post matching`);
    console.log("Production seed complete! FitThreads is ready for launch.");
}

seedProduction()
    .then(async () => await prisma.$disconnect())
    .catch(async (e) => {
        console.error("Production seed failed:", e);
        await prisma.$disconnect();
        process.exit(1);
    });

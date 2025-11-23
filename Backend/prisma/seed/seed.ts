import { prisma } from "../prismaConfig.js";

async function main() {
    console.log('Start seeding ...');

    const user = await prisma.user.upsert({
        where: { email: 'seed_user@fitthreads.com' },
        update: {},
        create: {
            username: 'seed_user',
            email: 'seed_user@fitthreads.com',
            hashedPassword: 'dummy_hashed_password', 
            bio: 'I love fitness and coding!',
            isAdmin: true,
            updatedAt: new Date(),
        },
    });
    console.log(`User upserted: ${user.username}`);

    const tagNames = ['Running', 'Fitness', 'Nutrition', 'Weights', 'Recovery'];
    const tags = [];
    for (const name of tagNames) {
        const tag = await prisma.tag.upsert({
            where: { name },
            update: {},
            create: { name },
        });
        tags.push(tag);
    }
    console.log(`Tags upserted: ${tags.map(t => t.name).join(', ')}`);

    await prisma.post.deleteMany({
        where: { authorId: user.id },
    });
    console.log('Cleaned up old posts for seed user.');

    const postsData = [
        {
            title: 'Morning 5k Run',
            content: 'Just finished a 5k run! Felt great to be out in the fresh air. #running #fitness',
            tags: ['Running', 'Fitness'],
        },
        {
            title: 'Meal Prep Sunday',
            content: 'Meal prep for the week is done. Chicken, rice, and broccoli. Healthy eating starts now.',
            tags: ['Nutrition'],
        },
        {
            title: 'Rest Day Importance',
            content: 'Rest days are just as important as workout days. Listen to your body.',
            tags: ['Recovery', 'Fitness'],
        },
        {
            title: 'Heavy Lifting Session',
            content: 'Hit a new PR on deadlifts today! 315lbs. Hard work pays off.',
            tags: ['Weights', 'Fitness'],
        },
    ];

    for (const p of postsData) {
        const post = await prisma.post.create({
            data: {
                title: p.title,
                content: p.content,
                authorId: user.id,
                postTags: {
                    create: p.tags.map(tagName => ({
                        tags: {
                            connect: { name: tagName },
                        },
                    })),
                },
            },
        });
        console.log(`Created post: "${post.title}"`);

    
        await prisma.like.create({
            data: {
                userId: user.id,
                postId: post.id,
            },
        });

        if (p === postsData[0]) {
            await prisma.favorite.create({
                data: {
                    userId: user.id,
                    postId: post.id,
                },
            });
            console.log(`Favorited post: "${post.title}"`);
        }
    }

    console.log('Seeding finished.');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });

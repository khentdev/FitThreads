import { prisma } from "../prismaConfig.js";

async function main() {
    console.log('Start seeding ...');

    const posts = [
        {
            content: 'Just finished a 5k run! #running #fitness',
            likes: 5,
        },
        {
            content: 'Meal prep for the week is done. Healthy eating starts now.',
            likes: 12,
        },
        {
            content: 'Rest days are just as important as workout days.',
            likes: 8,
        },
    ];

    for (const p of posts) {
        const post = await prisma.post.create({
            data: p,
        });
        console.log(`Created post with id: ${post.id}`);
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

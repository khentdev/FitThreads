import { prisma } from "../../../prisma/prismaConfig.js"
import { CreatePostParams, GetFeedParams } from "./types.js"
import { encodeCursor } from "./utils/cursor.js";

export const createPost = async ({
    authorId,
    title,
    content,
    postTags
}: CreatePostParams): Promise<void> => {
    await prisma.post.create({
        data: {
            authorId: authorId,
            title: title,
            content: content,
            postTags: {
                create: postTags.map((tag) => ({
                    tags: {
                        connectOrCreate: {
                            where: { name: tag.toLowerCase() },
                            create: { name: tag.toLowerCase() }
                        }
                    }
                }))
            }
        }
    })
}

export const getFeed = async ({ cursor, limit = 5 }: GetFeedParams) => {
    const prismaCursor = cursor ? { createdAt: new Date(cursor.createdAt), id: cursor.id } : undefined;

    const posts = await prisma.post.findMany({
        orderBy: [
            { createdAt: 'desc' },
            { id: 'desc' },
        ],
        cursor: prismaCursor,
        skip: prismaCursor ? 1 : 0,
        take: limit + 1,

        select: {
            id: true,
            title: true,
            content: true,
            createdAt: true,
            author: { select: { id: true, username: true, bio: true } },
            postTags: { select: { tags: { select: { name: true } } } },
            _count: { select: { likes: true, favorites: true } },
        },
    });

    const hasMore = posts.length > limit;
    const data = hasMore ? posts.slice(0, limit) : posts;

    const nextCursor = hasMore && data.length > 0
        ? encodeCursor({
            createdAt: data[data.length - 1].createdAt.toISOString(),
            id: data[data.length - 1].id,
        })
        : null;
    return { data, nextCursor, hasMore };
};
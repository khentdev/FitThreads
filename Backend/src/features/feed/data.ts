import { Prisma, prisma } from "../../../prisma/prismaConfig.js"
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
                    tag: {
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


export const getFeed = async ({ cursor, limit = 20, sortBy = "recent", search, username }: GetFeedParams) => {
    const prismaCursor = cursor ? { id: cursor.id } : undefined;

    const prismaWhereClause: Prisma.PostWhereInput = search ? {
        author: {
            isAdmin: false
        },
        deletedAt: null,
        OR: [
            { title: { search } },
            { content: { search } },
            { author: { username: { search } } },
            { postTags: { some: { tag: { name: { search } } } } }
        ]
    } : {
        // username is used only for getting posts from a specific user, 
        // if username exists -> getting posts from a specific user
        // else -> getting posts from all users
        ...(username ? { author: { username, isAdmin: false } } : { author: { isAdmin: false } }),
        deletedAt: null,
    }

    const sortByClause: Prisma.PostOrderByWithRelationInput[] = search ?
        [{
            _relevance: {
                search,
                fields: ["title", "content"],
                sort: "desc"
            }
        },
        sortBy === "top" ? { likes: { _count: "desc" } } : { createdAt: "desc" },
        ] :
        [{ createdAt: "desc", }]

    const posts = await prisma.post.findMany({
        where: prismaWhereClause,
        orderBy: sortByClause,
        cursor: prismaCursor,
        skip: prismaCursor ? 1 : 0,
        take: limit + 1,
        select: {
            id: true,
            title: true,
            content: true,
            createdAt: true,
            author: { select: { id: true, username: true, bio: true } },
            postTags: { select: { tag: { select: { name: true } } } },
            _count: { select: { likes: true, favorites: true } },
        },
    });

    const hasMore = posts.length > limit;
    const data = hasMore ? posts.slice(0, limit) : posts;
    const nextCursor = hasMore && data.length > 0
        ? encodeCursor({
            id: data[data.length - 1].id,
        })
        : null;
    return { data, nextCursor, hasMore };
};
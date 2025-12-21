import { Prisma, prisma } from "../../../prisma/prismaConfig.js"
import { CreatePostParams, GetFeedParams, GetUserFavoritesParams, getUserFavoritesResponseDTO, ToggleLikeParams } from "./types.js"
import { encodeCursor } from "../../lib/cursor.js";
import { encodeCursor as encodeFeedCursor, FeedCursor } from "./utils/cursor.js";

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


export const getFeed = async ({ cursor, limit = 20, sortBy = "recent", search, username, excludeUserId }: GetFeedParams) => {
    const prismaCursor = cursor ? { id: cursor.id } : undefined;

    const prismaWhereClause: Prisma.PostWhereInput = search ? {
        author: {
            isAdmin: false,
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
        ...(username ? { author: { username, isAdmin: false } } : {
            author: {
                isAdmin: false,
                // Exclude authenticated user's posts from public feed (but not from profile view)
                ...(excludeUserId ? { id: { not: excludeUserId } } : {})
            }
        }),
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



export const getUserFavorites = async ({ username, cursor, limit = 20 }: GetUserFavoritesParams): Promise<getUserFavoritesResponseDTO> => {
    const user = await prisma.user.findUnique({
        where: { username },
        select: { id: true }
    });

    if (!user) return null

    const prismaCursor = cursor ? {
        userId_postId: {
            userId: user.id,
            postId: cursor.id
        }
    } : undefined;

    const favorites = await prisma.favorite.findMany({
        where: {
            userId: user.id
        },
        orderBy: [
            { createdAt: 'desc' },
            { postId: 'desc' }
        ],
        cursor: prismaCursor,
        skip: prismaCursor ? 1 : 0,
        take: limit + 1,
        select: {
            createdAt: true,
            post: {
                select: {
                    id: true,
                    title: true,
                    content: true,
                    createdAt: true,
                    author: { select: { id: true, username: true, bio: true } },
                    postTags: { select: { tag: { select: { name: true } } } },
                    _count: { select: { likes: true, favorites: true } },
                }
            }
        }
    });

    const hasMore = favorites.length > limit;
    const data = hasMore ? favorites.slice(0, limit) : favorites;

    const nextCursor = hasMore && data.length > 0
        ? encodeFeedCursor({
            id: data[data.length - 1].post.id,
            createdAt: data[data.length - 1].createdAt
        })
        : null;

    return {
        data,
        nextCursor,
        hasMore
    };
}


/**
 * req 1: Delete like 
 * if no delete count -> deleted.count = 0
 * wasAlreadyLiked =  deleted.count > 0 (false)
 * Condition: If no delete count -> create like
 * Like exist now in db
 * hasLiked = !wasAlreadyLiked (true)
 * 
 * req 2: Delete Like
 * if delete count -> deleted.count = 1
 * wasAlreadyLiked =  deleted.count > 0 (true)
 * Condition: If delete count -> delete like
 * Like does not exist in db
 * hasLiked = !wasAlreadyLiked (false)
 */
export const toggleLike = async ({ postId, userId }: ToggleLikeParams) => {
    const deleted = await prisma.like.deleteMany({ where: { userId, postId } })
    const wasAlreadyLiked = deleted.count > 0
    if (!wasAlreadyLiked) {
        await prisma.like.create({ data: { postId, userId } })
    }
    const likeCount = await prisma.like.count({ where: { postId } })
    const hasLiked = !wasAlreadyLiked
    return { hasLiked, likeCount }
}

export const checkPostExists = async (postId: string) => {
    const post = await prisma.post.findUnique({
        where: { id: postId },
        select: { id: true }
    })
    return !!post
}
import { Prisma, prisma } from "../../../prisma/prismaConfig.js";
import { encodeCursor } from "../../lib/cursor.js";
import { CreatePostParams, GetFeedParams, GetFeedResponseDTO, GetUserFavoritesParams, getUserFavoritesResponseDTO, ToggleFavoriteParams, ToggleLikeParams } from "./types.js";
import { encodeCursor as encodeFeedCursor } from "./utils/cursor.js";

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


export const getFeed = async ({ cursor, limit = 20, sortBy = "recent", search, username, excludeUserId }: GetFeedParams): Promise<GetFeedResponseDTO> => {
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
            likes: true,
            favorites: true,
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

    const transformedData = data.map(post => ({
        ...post,
        hasLikedByUser: post.likes.some(p => p.userId === excludeUserId),
        hasFavoritedByUser: post.favorites.some(p => p.userId === excludeUserId),
        likes: undefined,
        favorites: undefined
    }))
    return { data: transformedData, nextCursor, hasMore };
};


export const getUserFavorites = async ({ username, cursor, limit = 20, authenticatedUserId }: GetUserFavoritesParams): Promise<getUserFavoritesResponseDTO> => {
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
                    likes: true,
                    favorites: true,
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

    const transformedData = data.map(post => ({
        ...post,
        post: {
            ...post.post,
            hasLikedByUser: post.post.likes.some(p => p.userId === authenticatedUserId),
            hasFavoritedByUser: post.post.favorites.some(p => p.userId === authenticatedUserId),
            likes: undefined,
            favorites: undefined
        }
    }))
    return {
        data: transformedData,
        nextCursor,
        hasMore
    };
}


export const toggleLike = async ({ postId, userId }: ToggleLikeParams) => {
    try {
        await prisma.like.create({ data: { userId, postId } })
        const likeCount = await prisma.like.count({ where: { postId } })
        return { hasLiked: true, likeCount }
    } catch (error: any) {
        if (error.code === 'P2002') {
            try {
                await prisma.like.delete({ where: { userId_postId: { userId, postId } } })
            } catch (deleteError: any) {
                if (deleteError.code !== 'P2025') throw deleteError
            }
            const likeCount = await prisma.like.count({ where: { postId } })
            return { hasLiked: false, likeCount }
        }
        throw error
    }
}

export const checkPostExists = async (postId: string) => {
    const post = await prisma.post.findUnique({
        where: { id: postId },
        select: { id: true }
    })
    return !!post
}

export const toggleFavorite = async ({ postId, userId }: ToggleFavoriteParams) => {
    try {
        await prisma.favorite.create({ data: { userId, postId } })
        const favoriteCount = await prisma.favorite.count({ where: { postId } })
        return { hasFavorited: true, favoriteCount }
    } catch (error: any) {
        if (error.code === 'P2002') {
            try {
                await prisma.favorite.delete({ where: { userId_postId: { userId, postId } } })
            } catch (deleteError: any) {
                if (deleteError.code !== 'P2025') throw deleteError
            }
            const favoriteCount = await prisma.favorite.count({ where: { postId } })
            return { hasFavorited: false, favoriteCount }
        }
        throw error
    }
}
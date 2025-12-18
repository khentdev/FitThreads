import { prisma } from "../../../prisma/prismaConfig.js";
import type { getUserProfileResponseDTO, SearchProfilesResponseDTO } from "./types.js";
import { decodeCursor, encodeCursor } from "../../lib/cursor.js";

export const getUserProfile = async (username: string): Promise<getUserProfileResponseDTO | null> => {
    const user = await prisma.user.findUnique({
        where: { username },
        select: {
            id: true,
            username: true,
            bio: true,
            createdAt: true
        }
    });

    if (!user) return null;

    const totalLikes = await prisma.like.count({
        where: {
            post: { authorId: user.id }
        }
    });

    return {
        username: user.username,
        bio: user.bio,
        joinedAt: user.createdAt,
        totalLikes
    };
};


export const searchProfiles = async (searchQuery: string, limit = 20, cursor?: string): Promise<SearchProfilesResponseDTO> => {
    const decodedCursor = decodeCursor(cursor);

    const users = await prisma.user.findMany({
        where: {
            isAdmin: false,
            OR: [
                { username: { contains: searchQuery, mode: 'insensitive' } },
                { bio: { contains: searchQuery, mode: 'insensitive' } }
            ]
        },
        orderBy: { username: "asc" },
        take: limit + 1,
        cursor: decodedCursor ? { id: decodedCursor.id} : undefined,
        skip: decodedCursor ? 1 : 0,
        select: {
            id: true,
            username: true,
            bio: true,
            createdAt: true,
            posts: {
                where: { deletedAt: null },
                select: { likes: { select: { userId: true } } }
            }
        }
    });

    const hasMore = users.length > limit;
    const data = hasMore ? users.slice(0, limit) : users;

    const mappedUsers = data.map(user => ({
        username: user.username,
        bio: user.bio,
        joinedAt: user.createdAt.toISOString(),
        totalLikes: user.posts.reduce<number>((likeHolder, post) => likeHolder + post.likes.length, 0)
    }));

    const nextCursor = hasMore && data.length > 0
        ? encodeCursor({ id: data[data.length - 1].id })
        : null;

    return { users: mappedUsers, nextCursor, hasMore };
};
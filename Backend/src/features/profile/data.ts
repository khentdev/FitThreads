import { prisma } from "../../../prisma/prismaConfig.js";
import type { getUserProfileResponseDTO } from "./types.js";

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

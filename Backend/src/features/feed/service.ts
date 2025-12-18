import { AppError } from "../../errors/customError.js";
import logger from "../../lib/logger.js";
import { createPost, getFeed, getUserFavorites } from "./data.js";
import type { CreatePostParams, GetFavoritedPostsParams, GetFeedParams, GetFeedResponseDTO } from "./types.js";
import { prisma } from "../../../prisma/prismaConfig.js";
import { decodeCursor as decodeFeedCursor } from "./utils/cursor.js";
import { getUserProfile } from "../profile/data.js";

export const createPostService = async ({ authorId, title, content, postTags }: CreatePostParams) => {
    try {
        await createPost({ authorId, title, content, postTags })
    } catch (err) {
        logger.error({ error: err }, "Failed to create post.")
        throw new AppError("POST_CREATION_FAILED", { field: "post" })
    }
}

export const getFeedService = async ({ cursor, limit, username, search, sortBy }: GetFeedParams): Promise<GetFeedResponseDTO> => {
    try {
        const posts = await getFeed({ cursor, limit, username, search, sortBy })
        return posts
    } catch (err) {
        logger.error({ error: err }, "Failed to get feed.")
        throw new AppError("FEED_RETRIEVAL_FAILED", { field: "feed" })
    }
}

export const getFavoritedPostsService = async ({ username, cursor, limit }: GetFavoritedPostsParams) => {
    const user = await getUserProfile(username);
    if (!user)
        throw new AppError("USER_NOT_FOUND", { field: "username" });

    const decodedCursor = decodeFeedCursor(cursor);
    try {
        const posts = await getUserFavorites({ username, decodedCursor, limit })
        return posts
    } catch (err) {
        logger.error({ error: err }, "Failed to get favorited posts.")
        throw new AppError("FAVORITED_POSTS_RETRIEVAL_FAILED", { field: "favoritedPosts" })
    }
}
import { AppError } from "../../errors/customError.js";
import logger from "../../lib/logger.js";
import { isValidUUID } from "../../lib/validation.js";
import { createPost, getFeed, getUserFavorites, toggleLike, checkPostExists } from "./data.js";
import type { CreatePostParams, GetFavoritedPostsParams, GetFeedParams, GetFeedResponseDTO } from "./types.js";
import { decodeCursor as decodeFeedCursor } from "./utils/cursor.js";

export const createPostService = async ({ authorId, title, content, postTags }: CreatePostParams) => {
    try {
        await createPost({ authorId, title, content, postTags })
    } catch (err) {
        logger.error({ error: err }, "Failed to create post.")
        throw new AppError("POST_CREATION_FAILED", { field: "post" })
    }
}

export const getFeedService = async ({ cursor, limit, username, search, sortBy, excludeUserId }: GetFeedParams): Promise<GetFeedResponseDTO> => {
    try {
        const posts = await getFeed({ cursor, limit, username, search, sortBy, excludeUserId })
        return posts
    } catch (err) {
        logger.error({ error: err }, "Failed to get feed.")
        throw new AppError("FEED_RETRIEVAL_FAILED", { field: "feed" })
    }
}

export const getFavoritedPostsService = async ({ username, cursor, limit }: GetFavoritedPostsParams) => {
    const decodedCursor = decodeFeedCursor(cursor);
    try {
        const posts = await getUserFavorites({ username, cursor: decodedCursor, limit })
        return posts
    } catch (err) {
        logger.error({ error: err }, "Failed to get favorited posts.")
        throw new AppError("FAVORITED_POSTS_RETRIEVAL_FAILED", { field: "favoritedPosts" })
    }
}

export const toggleLikeService = async ({ postId, userId }: { postId: string, userId: string }) => {
    // This will never execute unless unknown attacker explicitly tries to inject invalid UUID
    if (!isValidUUID(postId)) throw new Error("Invalid Post UUID")

    const postExists = await checkPostExists(postId)
    if (!postExists)
        throw new AppError("POST_NOT_FOUND", { field: "post" })

    try {
        return await toggleLike({ postId, userId })
    } catch (err) {
        logger.error({ error: err }, "Failed to toggle like.")
        throw new AppError("TOGGLE_LIKE_FAILED", { field: "like" })
    }
}
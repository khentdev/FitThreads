import { AppError } from "../../errors/customError.js";
import logger from "../../lib/logger.js";
import { createPost, getFeed } from "./data.js";
import { CreatePostParams, GetFeedParams } from "./types.js";

export const createPostService = async ({ authorId, title, content, postTags }: CreatePostParams) => {
    try {
        await createPost({ authorId, title, content, postTags })
    } catch (err) {
        logger.error({ error: err }, "Failed to create post.")
        throw new AppError("POST_CREATION_FAILED", { field: "post" })
    }
}

export const getFeedService = async ({ cursor, limit }: GetFeedParams) => {
    try {
        const posts = await getFeed({ cursor, limit })
        return posts
    } catch (err) {
        logger.error({ error: err }, "Failed to get feed.")
        throw new AppError("FEED_RETRIEVAL_FAILED", { field: "feed" })
    }
}
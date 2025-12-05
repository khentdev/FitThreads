import { AppError } from "../../errors/customError.js";
import logger from "../../lib/logger.js";
import { createPost } from "./data.js";
import { CreatePostParams } from "./types.js";

export const createPostService = async ({ authorId, title, content, postTags }: CreatePostParams) => {
    try {
        await createPost({ authorId, title, content, postTags })
    } catch (err) {
        logger.error({ error: err }, "Failed to create post.")
        throw new AppError("POST_CREATION_FAILED", { field: "post" })
    }
}
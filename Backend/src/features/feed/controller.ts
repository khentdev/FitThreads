import { Context } from "hono";
import { CreatePostParamsVariables } from "./types.js";
import { createPostService, getFeedService } from "./service.js";
import { getSanitizedFeedQuery } from "./utils/getSanitizedFeedQuery.js";

export const createPostController = async (c: Context<{ Variables: CreatePostParamsVariables }>) => {
    const { authorId, title, content, postTags } = c.get("createPostParams")
    await createPostService({ authorId, title, content, postTags })
    return c.json({ message: "Your fitness thought is now live!" }, 201)
}

export const getFeedController = async (c: Context) => {
    const { cursor, limit, sortBy, search, username } = getSanitizedFeedQuery(c)
    const result = await getFeedService({ cursor, limit, sortBy, search, username })
    return c.json(result, 200)
}
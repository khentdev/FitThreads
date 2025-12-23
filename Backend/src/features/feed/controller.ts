import { Context } from "hono";
import { CreatePostParamsVariables } from "./types.js";
import { createPostService, getFeedService, getFavoritedPostsService, toggleLikeService, toggleFavoriteService } from "./service.js";
import { getSanitizedFeedQuery } from "./utils/getSanitizedFeedQuery.js";
import { OptionalVerifyTokenVariables } from "../../middleware/validateOptionalAccessToken.js";
import { VerifyTokenVariables } from "../../middleware/validateAccessToken.js";

export const createPostController = async (c: Context<{ Variables: CreatePostParamsVariables }>) => {
    const { authorId, title, content, postTags } = c.get("createPostParams")
    await createPostService({ authorId, title, content, postTags })
    return c.json({ message: "Your fitness thought is now live!" }, 201)
}

export const getFeedController = async (c: Context<{ Variables: OptionalVerifyTokenVariables }>) => {
    const { cursor, limit, sortBy, search, username } = getSanitizedFeedQuery(c)
    const optionalAuth = c.get("optionalVerifyTokenVariables")
    const excludeUserId = optionalAuth?.userId
    const result = await getFeedService({ cursor, limit, sortBy, search, username, excludeUserId })
    return c.json(result, 200)
}

export const getFavoritedPostsController = async (c: Context<{ Variables: OptionalVerifyTokenVariables }>) => {
    const username = c.req.query("username") || ""
    const cursor = c.req.query("cursor") || ""
    const rawLimit = c.req.query("limit") || ""
    const limit = Math.min(Math.max(Number(rawLimit) || 20, 1), 20);

    const optionalAuth = c.get("optionalVerifyTokenVariables")
    const authenticatedUserId = optionalAuth?.userId

    const result = await getFavoritedPostsService({ username, cursor, limit, authenticatedUserId })
    return c.json(result, 200)
}

export const toggleLikeController = async (c: Context<{ Variables: VerifyTokenVariables }>) => {
    const postId = c.req.param("postId")
    const { user } = c.get("verifyTokenVariables")
    const result = await toggleLikeService({ postId, userId: user.id })
    return c.json(result, 200)
}

export const toggleFavoriteController = async (c: Context<{ Variables: VerifyTokenVariables }>) => {
    const postId = c.req.param("postId")
    const { user } = c.get("verifyTokenVariables")
    const result = await toggleFavoriteService({ postId, userId: user.id })
    return c.json(result, 200)
}

import { Context, Next } from "hono";
import { CreatePostParamsVariables, CreatePostRequestBody } from "./types.js";
import { VerifyTokenVariables } from "../../middleware/validateAccessToken.js";
import { isMinLength, isWithinMaxLength, isWithinLengthRange, notEmpty } from "../../lib/validation.js";
import { AppError } from "../../errors/customError.js";
import { enforceRateLimit } from "../../lib/rateLimit.js";
import { getClientIp } from "../../lib/extractIp.js";
import { env } from "../../configs/env.js";

const POST_TITLE_MIN = 6;
const POST_TITLE_MAX = 100;
const POST_CONTENT_MIN = 20;
const POST_CONTENT_MAX = 500;
const POST_TAGS_MIN = 1;
const POST_TAGS_MAX = 5;
const POST_TAG_MIN_LENGTH = 2;
const POST_TAG_MAX_LENGTH = 30;
const POST_TAG_REGEX = /^[a-zA-Z0-9_-]+$/;

export const validateCreatingPost = async (c: Context<{ Variables: VerifyTokenVariables & CreatePostParamsVariables }>, next: Next) => {
    const { user } = c.get("verifyTokenVariables")
    const { title, content, postTags } = await c.req.json<CreatePostRequestBody>()
    const clientIp = getClientIp(c)

    if (!isMinLength(title, POST_TITLE_MIN))
        throw new AppError("TITLE_MIN_LENGTH", { field: "title" })

    if (!isWithinMaxLength(title, POST_TITLE_MAX))
        throw new AppError("TITLE_MAX_LENGTH", { field: "title" })

    if (!isMinLength(content, POST_CONTENT_MIN))
        throw new AppError("CONTENT_MIN_LENGTH", { field: "content" })

    if (!isWithinMaxLength(content, POST_CONTENT_MAX))
        throw new AppError("CONTENT_MAX_LENGTH", { field: "content" })

    if (!Array.isArray(postTags) || postTags.length < POST_TAGS_MIN)
        throw new AppError("POST_TAGS_INVALID", { field: "post_tags" })

    if (postTags.length > POST_TAGS_MAX)
        throw new AppError("POST_TAGS_LIMIT_EXCEEDED", { field: "post_tags" })

    for (const tag of postTags) {
        if (!isWithinLengthRange(tag, POST_TAG_MIN_LENGTH, POST_TAG_MAX_LENGTH)) {
            if (!isMinLength(tag, POST_TAG_MIN_LENGTH))
                throw new AppError("POST_TAG_MIN_LENGTH", { field: "post_tags" })
            throw new AppError("POST_TAG_MAX_LENGTH", { field: "post_tags" })
        }
        if (!notEmpty(tag) || !POST_TAG_REGEX.test(tag as string))
            throw new AppError("POST_TAG_FORMAT_INVALID", { field: "post_tags" })

    }

    await enforceRateLimit(c, {
        endpoint: "feed/create-post",
        identifier: clientIp,
        identifierType: "ip",
        errorCode: "CREATE_POST_IP_RATE_LIMIT_EXCEEDED",
        maxRequests: env.RATELIMIT_CREATE_POST_IP_MAX,
        timeWindow: `${env.RATELIMIT_CREATE_POST_IP_WINDOW} s`
    })

    await enforceRateLimit(c, {
        endpoint: "feed/create-post",
        identifier: user.id,
        identifierType: "user",
        errorCode: "CREATE_POST_USER_RATE_LIMIT_EXCEEDED",
        maxRequests: env.RATELIMIT_CREATE_POST_USER_MAX,
        timeWindow: `${env.RATELIMIT_CREATE_POST_USER_WINDOW} s`
    })

    c.set("createPostParams", {
        authorId: user.id,
        title: title as string,
        content: content as string,
        postTags: postTags as string[]
    })
    await next()
}

export const rateLimitLikeFavoritePost = async (c: Context<{ Variables: VerifyTokenVariables }>, next: Next) => {
    const { user } = c.get("verifyTokenVariables")

    await enforceRateLimit(c, {
        endpoint: "feed/like-favorite-post",
        identifier: user.id,
        identifierType: "user",
        errorCode: "TOGGLE_LIKE_FAVORITE_RATELIMIT_EXCEEDED",
        maxRequests: env.RATELIMIT_LIKE_FAVORITE_USER_MAX,
        timeWindow: `${env.RATELIMIT_LIKE_FAVORITE_USER_WINDOW} s`
    })

    await next()
}
import { Context, Next } from "hono";
import { AppError } from "../../errors/customError.js";
import { getClientIp } from "../../lib/extractIp.js";
import { enforceRateLimit } from "../../lib/rateLimit.js";
import { env } from "../../configs/env.js";

export const validateUsernameParam = async (c: Context, next: Next) => {
    const username = c.req.param("username")
    const usernameRegex = /^[a-z0-9_]{3,30}$/
    const clientIp = getClientIp(c)

    if (!username || !usernameRegex.test(username)) {
        throw new AppError("INVALID_USERNAME_FORMAT", {
            field: "username"
        });
    }
    await enforceRateLimit(c, {
        endpoint: "profile/get-user-profile",
        identifier: clientIp,
        identifierType: "ip",
        errorCode: "GET_USER_PROFILE_RATELIMIT_EXCEEDED",
        maxRequests: env.RATELIMIT_GET_USER_PROFILE_IP_MAX,
        timeWindow: `${env.RATELIMIT_GET_USER_PROFILE_IP_WINDOW} s`
    })

    await next();
};

export const rateLimitProfileSearch = async (c: Context, next: Next) => {
    const clientIp = getClientIp(c)
    const searchQuery = c.req.query("searchQuery") || ""
    if (searchQuery && searchQuery.trim().length > 0) {
        await enforceRateLimit(c, {
            endpoint: "profile/search",
            identifier: clientIp,
            identifierType: "ip",
            errorCode: "PROFILE_SEARCH_RATELIMIT_EXCEEDED",
            maxRequests: env.RATELIMIT_PROFILE_SEARCH_IP_MAX,
            timeWindow: `${env.RATELIMIT_PROFILE_SEARCH_IP_WINDOW} s`
        })
    }
    await next()
}

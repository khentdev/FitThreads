import { Context } from "hono";
import { rateLimit, RateLimitParams } from "../configs/redis.js";
import { AppError } from "../errors/customError.js";
import { ErrorCodes } from "../errors/index.js";



export type RateLimitMiddlewareParams = {
    endpoint: string
    identifier: string
    identifierType: string
    errorCode: ErrorCodes
} & RateLimitParams

/**
 * Enforces rate limiting for a request and throws an error if limit is exceeded
 * @param {Context} c - Hono context
 * @param {RateLimitMiddlewareParams} params - Rate limit parameters
 * @param {string} params.endpoint - API endpoint being rate limited (e.g., 'login', 'signup')
 * @param {string} params.identifier - Unique identifier value (IP address, user ID, or email)
 * @param {string} params.identifierType - Type of identifier being used (e.g., 'ip', 'user', 'email')
 * @param {ErrorCodes} params.errorCode - Error code to return when rate limit is exceeded
 * @param {number} params.maxRequests - Maximum number of requests allowed
 * @param {Duration} params.timeWindow - Time window for rate limit
 */
export const enforceRateLimit = async (c: Context, { endpoint, identifier, identifierType, errorCode, maxRequests, timeWindow }: RateLimitMiddlewareParams) => {
    const key = `ratelimit:${endpoint}:${identifierType}:${identifier}`
    const { success, reset, remaining, limit } = await rateLimit({ maxRequests, timeWindow }).limit(key)

    c.header(`X-RateLimit-${identifierType}-Remaining`, remaining.toString())
    c.header(`X-RateLimit-${identifierType}-Limit`, limit.toString())
    c.header(`X-RateLimit-${identifierType}-Reset`, reset.toString())

    const retryAfter = Math.ceil((reset - Date.now()) / 1000).toString()
    if (!success) {
        c.header("Retry-After", retryAfter);
        throw new AppError(errorCode)
    }
}
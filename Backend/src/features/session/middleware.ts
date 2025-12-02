import { Context, Next } from "hono"
import { env } from "../../configs/env.js"
import { getCookieValue } from "../auth/cookie.config.js"
import { compareHashes, hashData } from "../../lib/hash.js"
import { isValidDeviceFingerprint } from "../../lib/validation.js"
import { verifyTokenOrThrow } from "./tokens.js"
import { prisma } from "../../../prisma/prismaConfig.js"
import { AppError } from "../../errors/customError.js"
import { SessionPayloadParams } from "./types.js"

export const validateSession = async (c: Context, next: Next) => {
    const isProd = env.NODE_ENV === "production"
    const cookieName = isProd ? "__Secure-sid" : "sid"
    const sessionCookie = getCookieValue(c, `${cookieName}`)
    const csrfTokenFromCookie = getCookieValue(c, "csrfToken")
    const csrfTokenFromHeader = c.req.header("X-CSRF-Token")
    const fingerprint = c.req.header("X-Fingerprint")

    const Unauthorized = (reason: string, field: string): AppError => {
        console.warn(`[Session] Validation failed: ${reason}`)
        return new AppError("SESSION_UNAUTHORIZED", { field })
    }

    if (!csrfTokenFromCookie || !csrfTokenFromHeader || !sessionCookie || csrfTokenFromCookie !== csrfTokenFromHeader)
        throw Unauthorized("CSRF or session cookie validation failed", "session_csrf")

    if (!isValidDeviceFingerprint(fingerprint))
        throw Unauthorized("Invalid fingerprint format", "device_fingerprint")

    const payload = await verifyTokenOrThrow(sessionCookie)

    if (!compareHashes(fingerprint!, payload.deviceId))
        throw Unauthorized("Fingerprint mismatch", "device_fingerprint")

    const user = await prisma.user.findUnique({ where: { id: payload.userId } })
    if (!user) throw Unauthorized("User not found for valid token", "user")

    const tokenExists = await prisma.session.findUnique({ where: { userId_token: { token: hashData(sessionCookie), userId: user.id } } })
    if (!tokenExists) throw Unauthorized("Invalid session token", "session_token")

    const sessionPayload: SessionPayloadParams = {
        user,
        deviceId: hashData(fingerprint as string),
        oldToken: sessionCookie
    }
    c.set("sessionPayload", sessionPayload)
    await next()
}
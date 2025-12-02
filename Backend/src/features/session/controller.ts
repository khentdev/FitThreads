import { Context } from "hono";
import { SessionPayloadVariables } from "./types.js";
import { refreshSessionService } from "./service.js";
import { setAuthCookie, setCSRFCookie } from "../auth/cookie.config.js";
import { tokenExpiry } from "../../configs/env.js";

export const refreshSessionController = async (c: Context<{ Variables: SessionPayloadVariables }>) => {
    const { user, deviceId, oldToken } = c.get("sessionPayload")
    const { accessToken, refreshToken, csrfToken, user: updatedUser } = await refreshSessionService({ user, deviceId, oldToken })
    setAuthCookie({ c, name: "sid", value: refreshToken, options: { maxAge: tokenExpiry().refreshTokenMaxAge } })
    setCSRFCookie({ c, name: "csrfToken", value: csrfToken, options: { maxAge: tokenExpiry().csrfTokenMaxAge } })
    return c.json({
        accessToken, user: {
            email: updatedUser.email,
            username: updatedUser.username,
            emailVerified: updatedUser.emailVerified,
        }
    })
}
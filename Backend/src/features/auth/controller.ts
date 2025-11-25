import { Context } from "hono";
import {
    sendAccountVerificationOTPService,
    verifyOTPAndCreateAccountService
} from "./service.js";
import {
    SendOTPParamsVariables,
    VerifyOTPAndCreateAccountParamsVariables
} from "./types.js";
import { setAuthCookie, setCSRFCookie } from "./cookie.config.js";
import { tokenExpiry } from "../../configs/env.js";
import { prisma } from "../../../prisma/prismaConfig.js";

// For development purposes only
export const deleteUserByEmailController = async (
    c: Context
) => {
    const { email } = await c.req.json<{ email: string }>()
    const exist = await prisma.user.findUnique({ where: { email } })
    if (exist) return c.json({ error: "User not found or already deleted" }, 404)
    try {
        await prisma.user.delete({ where: { email } })
        return c.json({
            message: "User deleted successfully"
        }, 200);
    } catch (err) {
        return c.json({ error: "Error deleting this user." }, 500)
    }
}

export const sendAccountVerificationOTPController = async (
    c: Context<{ Variables: SendOTPParamsVariables }>
) => {
    const { username, email, password } = c.get("sendOTPParams");
    await sendAccountVerificationOTPService({ username, email, password });
    return c.json({
        message: "Verification code sent to your email. Please check your inbox."
    }, 200);
};

export const verifyOTPAndCreateAccountController = async (
    c: Context<{ Variables: VerifyOTPAndCreateAccountParamsVariables }>
) => {
    const { deviceId, otp } = c.get("verifyOTPParams");
    const { accessToken, csrfToken, refreshToken, user } = await verifyOTPAndCreateAccountService({
        deviceId,
        otp
    });
    setAuthCookie({
        c,
        name: "sid",
        value: refreshToken,
        options: { maxAge: tokenExpiry().refreshTokenMaxAge }
    });
    setCSRFCookie({
        c,
        name: "csrfToken",
        value: csrfToken,
        options: { maxAge: tokenExpiry().csrfTokenMaxAge }
    });
    return c.json({
        message: "Welcome to FitThreads!",
        accessToken,
        user: {
            emailVerified: user.emailVerified,
            email: user.email,
            username: user.username
        }
    }, 201);
};

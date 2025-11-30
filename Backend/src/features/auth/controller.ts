import { Context } from "hono";
import {
    loginService,
    sendAccountVerificationOTPService,
    verifyEmailAndCreateSessionService,
    resendVerificationOTPService,
    sendMagicLinkService,
} from "./service.js";
import {
    LoginParamsVariables,
    SendOTPParamsVariables,
    VerifyEmailAndCreateSessionParamsVariables,
    ResendOTPParamsVariables,
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
    if (!exist) return c.json({ error: "User not found or already deleted" }, 404)
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
    const { username, email: emailParam, password } = c.get("sendOTPParams");
    const res = await sendAccountVerificationOTPService({ username, email: emailParam, password });
    return c.json({
        message: "Verification code sent to your email. Please check your inbox.",
        email: res.email
    }, 200);
};

export const verifyEmailAndCreateSessionController = async (
    c: Context<{ Variables: VerifyEmailAndCreateSessionParamsVariables }>
) => {
    const { deviceId, otp } = c.get("verifyOTPParams");
    const { accessToken, csrfToken, refreshToken, user } = await verifyEmailAndCreateSessionService({
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

export const loginController = async (
    c: Context<{ Variables: LoginParamsVariables }>
) => {
    const { username, password, deviceId } = c.get("loginParams");
    const { accessToken, csrfToken, refreshToken, user } = await loginService({
        username,
        password,
        deviceId
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
        message: "Welcome back!",
        accessToken,
        user: {
            emailVerified: user.emailVerified,
            email: user.email,
            username: user.username
        }
    }, 200);
};

export const resendVerificationOTPController = async (
    c: Context<{ Variables: ResendOTPParamsVariables }>
) => {
    const { email } = c.get("resendOTPParams");
    await resendVerificationOTPService({ email });
    return c.json({
        message: "Verification code sent to your email. Please check your inbox."
    }, 200);
};


export const sendMagicLinkController = async (c: Context<{ Variables: { validatedMagicLinkParams: { email: string } } }>) => {
    const { email } = c.get("validatedMagicLinkParams")
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return c.json({ message: "Magic link sent - check your inbox.", email }, 200)

    const res = await sendMagicLinkService(email, user)
    return c.json({ message: "Magic link sent - check your inbox.", email: res.email }, 200)
}
import { Context, Next } from "hono";
import { AppError } from "../../errors/customError.js";
import { getClientIp } from '../../lib/extractIp.js';
import { hashData } from "../../lib/hash.js";
import { isValidOTPFormat } from "../../lib/otp.js";
import { enforceRateLimit } from "../../lib/rateLimit.js";
import { isMinLength, isValidDeviceFingerprint, isValidEmail, isValidUsername, notEmpty } from "../../lib/validation.js";
import type {
    LoginRequestBody,
    ResendOTPRequestBody,
    SendOTPRequestBody,
    VerifyEmailAndCreateSessionRequestBody,
} from "./types.js";
import { env } from "../../configs/env.js";


export const validateSendOTP = async (c: Context, next: Next) => {
    const { username, email, password } = await c.req.json<SendOTPRequestBody>();
    const clientIp = getClientIp(c)

    if (!notEmpty(username))
        throw new AppError("AUTH_USERNAME_REQUIRED", { field: "username" });

    if (!isValidUsername(username))
        throw new AppError("AUTH_USERNAME_INVALID_FORMAT", { field: "username" });

    if (!isValidEmail(email))
        throw new AppError("AUTH_EMAIL_REQUIRED", { field: "email" });

    if (!isMinLength(password, 8))
        throw new AppError("AUTH_PASSWORD_MIN_LENGTH", { field: "password" });

    await enforceRateLimit(c, {
        endpoint: "signup/send-otp",
        identifier: clientIp,
        identifierType: "ip",
        errorCode: "AUTH_RATE_LIMIT_SIGNUP",
        maxRequests: env.RATELIMIT_SIGNUP_IP_MAX,
        timeWindow: `${env.RATELIMIT_SIGNUP_IP_WINDOW} s`
    })
    
    const payload = {
        username: (username as string).trim().toLowerCase(),
        email: (email as string).trim().toLowerCase(),
        password: (password as string).trim()
    };

    c.set("sendOTPParams", payload);
    await next();
};


export const validateVerifyOTPAndCreateAccount = async (c: Context, next: Next) => {
    const { otp } = await c.req.json<VerifyEmailAndCreateSessionRequestBody>();
    const fingerprint = c.req.header("X-Fingerprint");

    if (!isValidOTPFormat(otp, 6))
        throw new AppError("AUTH_OTP_INVALID_FORMAT", { field: "otp" });

    if (!isValidDeviceFingerprint(fingerprint))
        throw new AppError("AUTH_INVALID_DEVICE_FINGERPRINT", { field: "device_fingerprint" });

    const payload = {
        otp: (otp as string).trim(),
        deviceId: hashData(fingerprint as string)
    };

    c.set("verifyOTPParams", payload);
    await next();
};

export const validateLoginAccount = async (c: Context, next: Next) => {
    const { username, password } = await c.req.json<LoginRequestBody>();
    const fingerprint = c.req.header("X-Fingerprint");
    const clientIp = getClientIp(c)

    if (!notEmpty(username))
        throw new AppError("AUTH_USERNAME_REQUIRED", { field: "username" });

    if (!notEmpty(password))
        throw new AppError("AUTH_PASSWORD_REQUIRED", { field: "password" });

    if (!isMinLength(password, 8))
        throw new AppError("AUTH_PASSWORD_MIN_LENGTH", { field: "password" });

    if (!isValidDeviceFingerprint(fingerprint))
        throw new AppError("AUTH_INVALID_DEVICE_FINGERPRINT", { field: "device_fingerprint" });

    await enforceRateLimit(c, {
        endpoint: "login",
        identifier: clientIp,
        identifierType: "ip",
        errorCode: "AUTH_RATE_LIMIT_LOGIN",
        maxRequests: env.RATELIMIT_LOGIN_IP_MAX,
        timeWindow: `${env.RATELIMIT_LOGIN_IP_WINDOW} s`
    })

    await enforceRateLimit(c, {
        endpoint: "login",
        identifier: username as string,
        identifierType: "username",
        errorCode: "AUTH_RATE_LIMIT_LOGIN",
        maxRequests: env.RATELIMIT_LOGIN_USERNAME_MAX,
        timeWindow: `${env.RATELIMIT_LOGIN_USERNAME_WINDOW} s`
    })

    const payload = {
        username: (username as string).trim().toLowerCase(),
        password: (password as string).trim(),
        deviceId: hashData(fingerprint as string)
    };

    c.set("loginParams", payload);
    await next()
}

export const validateResendOTP = async (c: Context, next: Next) => {
    const { email } = await c.req.json<ResendOTPRequestBody>();

    if (!isValidEmail(email))
        throw new AppError("AUTH_EMAIL_REQUIRED", { field: "email" });

    const payload = {
        email: (email as string).trim().toLowerCase()
    };

    c.set("resendOTPParams", payload);
    await next();
};

export const validateSendMagicLink = async (c: Context, next: Next) => {
    const { email } = await c.req.json<{ email: unknown }>()
    if (!isValidEmail(email)) throw new AppError("AUTH_EMAIL_REQUIRED")
    const payload = {
        email: (email as string).trim().toLowerCase()
    };
    c.set("validatedMagicLinkParams", payload)
    await next()
}

export const validateVerifyMagicLink = async (c: Context, next: Next) => {
    const { token } = await c.req.json<{ token: unknown }>()
    const fingerprint = c.req.header("X-Fingerprint");

    if (!notEmpty(token)) throw new AppError("AUTH_MAGIC_LINK_INVALID_OR_EXPIRED", { field: "token" })
    if (!isValidDeviceFingerprint(fingerprint)) throw new AppError("AUTH_INVALID_DEVICE_FINGERPRINT", { field: "device_fingerprint" })

    const payload = {
        token: (token as string).trim(),
        deviceId: hashData(fingerprint as string)
    }
    c.set("verifyMagicLinkParams", payload)
    await next()
}
import { Context, Next } from "hono";
import { AppError } from "../../errors/customError.js";
import { notEmpty, isValidEmail, isMinLength, isValidDeviceFingerprint, isValidUsername } from "../../lib/validation.js";
import { hashData } from "../../lib/hash.js";
import { isValidOTPFormat } from "../../lib/otp.js";
import type {
    SendOTPRequestBody,
    VerifyOTPAndCreateAccountRequestBody
} from "./types.js";


export const validateSendOTP = async (c: Context, next: Next) => {
    const { username, email, password } = await c.req.json<SendOTPRequestBody>();

    if (!notEmpty(username))
        throw new AppError("AUTH_USERNAME_REQUIRED", { field: "username" });

    if (!isValidUsername(username))
        throw new AppError("AUTH_USERNAME_INVALID_FORMAT", { field: "username" });

    if (!isValidEmail(email))
        throw new AppError("AUTH_EMAIL_REQUIRED", { field: "email" });

    if (!isMinLength(password, 8))
        throw new AppError("AUTH_PASSWORD_MIN_LENGTH", { field: "password" });

    const payload = {
        username: (username as string).trim().toLowerCase(),
        email: (email as string).trim().toLowerCase(),
        password: (password as string).trim()
    };

    c.set("sendOTPParams", payload);
    await next();
};


export const validateVerifyOTPAndCreateAccount = async (c: Context, next: Next) => {
    const { otp } = await c.req.json<VerifyOTPAndCreateAccountRequestBody>();
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
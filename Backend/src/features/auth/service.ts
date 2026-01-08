import { prisma } from "../../../prisma/prismaConfig.js";
import bcrypt from "bcrypt";
import { AppError } from "../../errors/customError.js";
import { LoginParams, SendOTPParams, VerifyEmailAndCreateSessionParams, VerifyMagicLinkParams, VerifyPasswordResetParams } from "./types.js";
import { storeToken } from "../session/data.js";
import { generateTokens } from "../session/tokens.js";
import { hashData } from "../../lib/hash.js";
import { generateOTP } from "../../lib/otp.js";
import { RedisKeys } from "./utils/auth-keys.js";
import { emailTemplates } from "./utils/email-templates.js";
import { getRedisClient } from "../../configs/redis.js";
import { sendEmail } from "../../configs/resend.js";
import { env } from "../../configs/env.js";
import logger from "../../lib/logger.js";
import { randomUUID } from "crypto";
import { User } from "../../../generated/prisma/client.js";
import { generateMagicLink, generatePasswordResetLink } from "./utils/generateLink.js";

const generateAndSendOTP = async (userId: string, email: string) => {
    const otp = generateOTP(6);
    const redis = getRedisClient();
    const redisKey = RedisKeys.signupOTP(otp);

    try {
        await redis.setex(redisKey, env.OTP_EXPIRY_SECONDS, userId);
        logger.info({ email, redisKey, userId }, "OTP stored in Redis with userId");
    } catch (error) {
        logger.error({ error, email }, "Failed to store OTP in Redis");
        throw new AppError("AUTH_OTP_SEND_FAILED", { field: "email" });
    }

    const template = emailTemplates.signupOTP(otp);
    const emailResult = await sendEmail({
        from: env.EMAIL_FROM,
        to: email,
        subject: template.subject,
        html: template.html,
        text: template.text,
    });

    if (!emailResult.success) {
        await redis.del(redisKey);
        logger.error({ email, error: emailResult.error }, "Failed to send OTP email");
        throw new AppError("AUTH_OTP_SEND_FAILED", { field: "email" });
    }
    logger.info({ email, messageId: emailResult.messageId }, "OTP email sent successfully");
};

export const sendAccountVerificationOTPService = async ({ username, email, password }: SendOTPParams) => {

    const existingUsername = await prisma.user.findUnique({ where: { username } });
    if (existingUsername)
        throw new AppError("AUTH_USERNAME_ALREADY_TAKEN", { field: "username" });

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser)
        throw new AppError("AUTH_USER_ALREADY_EXISTS", { field: "email" });

    const hashedPassword = await bcrypt.hash(password, 10);

    let userId: string;
    try {
        const user = await prisma.user.create({
            data: {
                username,
                email,
                hashedPassword,
                emailVerified: false
            }
        });
        userId = user.id;
        logger.info({ email, username, userId }, "User account created, pending email verification");
    } catch (error) {
        logger.error({ error, email }, "Failed to create user account");
        throw new AppError("AUTH_ACCOUNT_CREATION_FAILED", { field: "create_account" });
    }

    try {
        await generateAndSendOTP(userId, email);
        return { email }
    } catch (error) {
        await prisma.user.delete({ where: { id: userId } });
        logger.error({ error, email }, "Failed to send OTP, rolled back user creation");
        throw error;
    }
};

export const verifyEmailAndCreateSessionService = async ({
    deviceId,
    otp
}: VerifyEmailAndCreateSessionParams) => {

    const redis = getRedisClient();
    const redisKey = RedisKeys.signupOTP(otp);
    const userId = await redis.get(redisKey) as string | null;

    if (!userId)
        throw new AppError("AUTH_OTP_INVALID_OR_EXPIRED", { field: "otp" });

    await redis.del(redisKey);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user)
        throw new AppError("AUTH_USER_NOT_FOUND", { field: "otp" });

    if (user.emailVerified)
        throw new AppError("AUTH_USER_ALREADY_VERIFIED", { field: "email" });

    try {
        const { accessToken, refreshToken, csrfToken, user: updatedUser } = await prisma.$transaction(async (tx) => {
            const updatedUser = await tx.user.update({
                where: { id: userId },
                data: {
                    emailVerified: true,
                    emailVerifiedAt: new Date()
                }, select: {
                    id: true, emailVerified: true, email: true, username: true
                }
            });

            const { accessToken, refreshToken, csrfToken, refreshTokenExpiry } = await generateTokens({
                deviceId,
                userId: updatedUser.id
            });

            const hashedToken = hashData(refreshToken);
            await storeToken({
                token: hashedToken,
                userId: updatedUser.id,
                expiresAt: new Date(refreshTokenExpiry * 1000)
            }, tx);

            return { accessToken, refreshToken, csrfToken, user: updatedUser };
        });

        logger.info({ email: user.email, userId: user.id }, "Email verified and account activated");
        return { accessToken, refreshToken, csrfToken, user: updatedUser };
    } catch (err) {
        logger.error({ error: err, userId }, "Failed to verify email and activate account");
        throw new AppError("AUTH_ACCOUNT_CREATION_FAILED", { field: "create_account" });
    }
};

export const loginService = async ({
    username,
    password, deviceId
}: LoginParams) => {

    const user = await prisma.user.findUnique({ where: { username }, select: { id: true, username: true, email: true, hashedPassword: true, emailVerified: true } })
    if (!user) throw new AppError("AUTH_INVALID_CREDENTIALS", { field: "username-password" })

    const correctPassword = await bcrypt.compare(password, user.hashedPassword)
    if (!correctPassword) throw new AppError("AUTH_INVALID_CREDENTIALS", { field: "username-password" })

    if (!user.emailVerified) {
        await generateAndSendOTP(user.id, user.email);
        throw new AppError("AUTH_USER_NOT_VERIFIED", { field: "email", data: { email: user.email } });
    }

    try {
        const { accessToken, refreshToken, csrfToken } = await prisma.$transaction(async (tx) => {
            const { accessToken: token, refreshToken: sid, csrfToken: csrf, refreshTokenExpiry } = await generateTokens({
                deviceId,
                userId: user.id
            });
            const hashedToken = hashData(sid);
            await storeToken({
                token: hashedToken,
                userId: user.id,
                expiresAt: new Date(refreshTokenExpiry * 1000)
            }, tx);
            return { accessToken: token, refreshToken: sid, csrfToken: csrf };
        });

        logger.info({ email: user.email, userId: user.id }, "User logged in successfully");
        return { accessToken, refreshToken, csrfToken, user };
    } catch (err) {
        logger.error({ error: err, userId: user.id }, "Failed to login");
        throw new AppError("AUTH_LOGIN_FAILED", { field: "login" });
    }
}

export const resendVerificationOTPService = async ({ email }: { email: string }) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new AppError("AUTH_USER_NOT_FOUND", { field: "email" });
    if (user.emailVerified) throw new AppError("AUTH_USER_ALREADY_VERIFIED", { field: "email" });

    await generateAndSendOTP(user.id, user.email);
};

export const sendMagicLinkService = async (email: string, user: User) => {
    if (!user.emailVerified) {
        await generateAndSendOTP(user.id, user.email);
        throw new AppError("AUTH_USER_NOT_VERIFIED", { field: "email", data: { email } });
    }

    const token = randomUUID().replace(/-/g, "").slice(0, 32)
    const redis = getRedisClient();
    const redisKey = RedisKeys.magicLink(token);

    try {
        await redis.setex(redisKey, env.MAGIC_LINK_EXPIRES_IN, email)
        logger.info({ email, redisKey }, "OTP stored in Redis with user email");
    } catch (err) {
        logger.error({ error: err, email }, "Failed to send magic link");
        throw new AppError("AUTH_SEND_MAGICLINK_FAILED", { field: "magic_link" });
    }

    const template = emailTemplates.magicLink(generateMagicLink(token))
    const emailResult = await sendEmail({
        from: env.EMAIL_FROM,
        to: email,
        subject: template.subject,
        html: template.html,
        text: template.text
    })

    if (!emailResult.success) {
        await redis.del(redisKey)
        logger.error({ email }, "Failed to send magic link");
        throw new AppError("AUTH_SEND_MAGICLINK_FAILED", { field: "magic_link" });
    }
    logger.info({ email, messageId: emailResult.messageId }, "Magiclink sent successfully");
    return { email }
}

export const verifyMagicLinkService = async ({ token, deviceId }: VerifyMagicLinkParams) => {
    const redis = getRedisClient();
    const redisKey = RedisKeys.magicLink(token);
    const email = await redis.get(redisKey) as string | null;

    if (!email) throw new AppError("AUTH_MAGIC_LINK_INVALID_OR_EXPIRED", { field: "token" });

    await redis.del(redisKey);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new AppError("AUTH_USER_NOT_FOUND", { field: "email" });

    try {
        const { accessToken, refreshToken, csrfToken } = await prisma.$transaction(async (tx) => {
            const { accessToken: token, refreshToken: sid, csrfToken: csrf, refreshTokenExpiry } = await generateTokens({
                deviceId,
                userId: user.id
            });
            const hashedToken = hashData(sid);
            await storeToken({
                token: hashedToken,
                userId: user.id,
                expiresAt: new Date(refreshTokenExpiry * 1000)
            }, tx);
            return { accessToken: token, refreshToken: sid, csrfToken: csrf };
        });

        logger.info({ email: user.email, userId: user.id }, "User logged in with magic link");
        return { accessToken, refreshToken, csrfToken, user };
    } catch (err) {
        logger.error({ error: err, userId: user.id }, "Failed to login with magic link");
        throw new AppError("AUTH_LOGIN_FAILED", { field: "login" });
    }
}

/**
 * Flow: Send email with otp(token) in a url query,
 * User received the email and clicked,
 * Redirected to frontend with token query,
 * Enters their (new password, confirm password) on form -> Submit
 */
export const sendPasswordLinkService = async (user: User, email: string) => {
    if (!user.emailVerified) {
        await generateAndSendOTP(user.id, user.email);
        throw new AppError("AUTH_USER_NOT_VERIFIED", { field: "email", data: { email } });
    }

    const redis = getRedisClient()
    const token = randomUUID().replace(/-/g, "").slice(0, 32)
    const redisKey = RedisKeys.passwordOTP(token)

    try {
        await redis.setex(redisKey, env.OTP_EXPIRY_SECONDS, email);
        logger.info({ email, redisKey }, "OTP stored in Redis with userId");
    } catch (error) {
        logger.error({ error, email }, "Failed to store OTP in Redis");
        throw new AppError("AUTH_PASSWORD_OTP_FAILED", { field: "password" });
    }

    const passwordLink = generatePasswordResetLink(token)
    const emailTemplate = emailTemplates.passwordReset(passwordLink)
    const emailResult = await sendEmail({
        from: env.EMAIL_FROM,
        to: email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
        text: emailTemplate.text
    })

    if (!emailResult.success) {
        await redis.del(redisKey)
        logger.error({ email }, "Failed to send password reset email");
        throw new AppError("AUTH_PASSWORD_OTP_FAILED", { field: "password" });
    }
    logger.info({ email, messageId: emailResult.messageId }, "Password reset email sent successfully");
    return { email }
}

export const verifyPasswordResetService = async ({ token, deviceId, confirmPassword }: VerifyPasswordResetParams) => {
    const redis = getRedisClient()
    const redisKey = RedisKeys.passwordOTP(token)

    const email = await redis.get(redisKey) as string | null;
    if (!email) throw new AppError("AUTH_PASSWORD_RESET_LINK_INVALID_OR_EXPIRED", { field: "password" })

    await redis.del(redisKey);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new AppError("AUTH_USER_NOT_FOUND", { field: "email" });

    try {
        const { accessToken, refreshToken, csrfToken } = await prisma.$transaction(async (tx) => {
            const hashedPassword = await bcrypt.hash(confirmPassword, 10)
            await tx.user.update({
                where: { id: user.id },
                data: {
                    hashedPassword
                }
            })
            const { accessToken: token, refreshToken: sid, csrfToken: csrf, refreshTokenExpiry } = await generateTokens({
                deviceId,
                userId: user.id
            });
            const hashedToken = hashData(sid);
            await storeToken({
                token: hashedToken,
                userId: user.id,
                expiresAt: new Date(refreshTokenExpiry * 1000)
            }, tx);
            return { accessToken: token, refreshToken: sid, csrfToken: csrf };
        });

        logger.info({ email: user.email, userId: user.id }, "User logged in automatically after password reset.");
        return { accessToken, refreshToken, csrfToken, user };
    } catch (err) {
        logger.error({ error: err, userId: user.id }, "Automatic login failed after password reset.");
        throw new AppError("AUTH_PASSWORD_RESET_FAILED", { field: "password" });
    }
}
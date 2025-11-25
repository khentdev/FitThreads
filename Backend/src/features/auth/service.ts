import { prisma } from "../../../prisma/prismaConfig.js";
import bcrypt from "bcrypt";
import { AppError } from "../../errors/customError.js";
import { SendOTPParams, VerifyOTPAndCreateAccountParams } from "./types.js";
import { storeToken } from "../session/data.js";
import { generateTokens } from "../session/tokens.js";
import { hashData } from "../../lib/hash.js";
import { generateOTP } from "../../lib/otp.js";
import { RedisKeys } from "../../lib/redis-keys.js";
import { emailTemplates } from "../../lib/email-templates.js";
import { getRedisClient } from "../../configs/redis.js";
import { sendEmail } from "../../configs/resend.js";
import { env } from "../../configs/env.js";
import logger from "../../lib/logger.js";

export const sendAccountVerificationOTPService = async ({ username, email, password }: SendOTPParams): Promise<void> => {

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

    const otp = generateOTP(6);
    const redis = getRedisClient();
    const redisKey = RedisKeys.signupOTP(otp);

    try {
        await redis.setex(redisKey, env.OTP_EXPIRY_SECONDS, userId);
        logger.info({ email, redisKey, userId }, "OTP stored in Redis with userId");
    } catch (error) {
        await prisma.user.delete({ where: { id: userId } });
        logger.error({ error, email }, "Failed to store OTP in Redis, rolled back user creation");
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
        await prisma.user.delete({ where: { id: userId } });
        logger.error({ email, error: emailResult.error }, "Failed to send OTP email, rolled back user creation");
        throw new AppError("AUTH_OTP_SEND_FAILED", { field: "email" });
    }
    logger.info({ email, messageId: emailResult.messageId }, "OTP email sent successfully");
};

export const verifyOTPAndCreateAccountService = async ({
    deviceId,
    otp
}: VerifyOTPAndCreateAccountParams) => {

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

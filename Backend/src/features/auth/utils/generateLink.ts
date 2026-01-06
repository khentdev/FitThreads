import { env } from "../../../configs/env.js";

const baseUrl =
    env.NODE_ENV === "production"
        ? env.FRONTEND_URL
        : env.FRONTEND_DEV_URL;

export const generateMagicLink = (token: string) =>
    `${baseUrl}/auth/magic-link?token=${encodeURIComponent(token)}`;

export const generatePasswordResetLink = (token: string) =>
    `${baseUrl}/auth/password-reset?token=${encodeURIComponent(token)}`;

import { randomUUID } from "crypto";
import { env } from "../configs/env.js";

const baseUrl =
    process.env.NODE_ENV === "production"
        ? env.FRONTEND_URL
        : env.FRONTEND_DEV_URL;

export const generateMagicLink = () =>
    `${baseUrl}/auth/magic-link?token=${encodeURIComponent(randomUUID())}`;
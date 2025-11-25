import { loadEnv } from "./loadEnv.js";


export function tokenExpiry() {
    const now = Math.floor(Date.now() / 1000);

    const accessTokenDuration = parseInt(loadEnv("JWT_ACCESS_TOKEN_EXPIRES_IN", "3600"), 10);
    const refreshTokenDuration = parseInt(loadEnv("JWT_REFRESH_TOKEN_EXPIRES_IN", "2592000"), 10);

    return {
        accessTokenExpiry: now + accessTokenDuration,
        refreshTokenExpiry: now + refreshTokenDuration,
        refreshTokenMaxAge: refreshTokenDuration,
        csrfTokenMaxAge: refreshTokenDuration,
    }
}

export const env = {
    NODE_ENV: loadEnv("NODE_ENV", "development"),
    PORT: parseInt(loadEnv("PORT", "3000")),
    HASH_SECRET: loadEnv("HASH_SECRET"),

    DATABASE_URL: loadEnv("DATABASE_URL"),

    REDIS_URL: loadEnv("REDIS_URL"),
    REDIS_TOKEN: loadEnv("REDIS_TOKEN"),

    JWT_SECRET: loadEnv("JWT_SECRET"),
    JWT_ISSUER: loadEnv("JWT_ISSUER", "fitthreads-api"),

    // // Magic Link
    // MAGIC_LINK_SECRET: loadEnv("MAGIC_LINK_SECRET"),
    // MAGIC_LINK_EXPIRES_IN: parseInt(loadEnv("MAGIC_LINK_EXPIRES_IN", "900")),

    // // Rate Limiting
    // RATE_LIMIT_POSTS_PER_HOUR: parseInt(loadEnv("RATE_LIMIT_POSTS_PER_HOUR", "6")),
    // RATE_LIMIT_LIKES_PER_MINUTE: parseInt(loadEnv("RATE_LIMIT_LIKES_PER_MINUTE", "100")),

    // Email (Resend)
    RESEND_API_KEY: loadEnv("RESEND_API_KEY"),
    EMAIL_FROM: loadEnv("EMAIL_FROM", "FitThreads <noreply@fitthreads.com>"),

    // OTP
    OTP_EXPIRY_SECONDS: parseInt(loadEnv("OTP_EXPIRY_SECONDS", "600")),
} as const;
export type Env = typeof env;

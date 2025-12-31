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

    FRONTEND_URL: loadEnv("FRONTEND_URL", "http://localhost:4173"), // Prod
    FRONTEND_DEV_URL: loadEnv("FRONTEND_DEV_URL", "http://localhost:5173"),

    MAGIC_LINK_EXPIRES_IN: parseInt(loadEnv("MAGIC_LINK_EXPIRES_IN", "600"), 10),

    // Rate Limits (Upstash Redis)
    // Auth - Login
    RATELIMIT_LOGIN_IP_MAX: 20,
    RATELIMIT_LOGIN_IP_WINDOW: 900, // 15 minutes
    RATELIMIT_LOGIN_USERNAME_MAX: 10,
    RATELIMIT_LOGIN_USERNAME_WINDOW: 3600, // 1 hour

    // Email (Resend)
    RESEND_API_KEY: loadEnv("RESEND_API_KEY"),
    EMAIL_FROM: loadEnv("EMAIL_FROM", "FitThreads <noreply@fitthreads.com>"),

    // OTP
    OTP_EXPIRY_SECONDS: parseInt(loadEnv("OTP_EXPIRY_SECONDS", "600")),
} as const;
export type Env = typeof env;

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
    RATELIMIT_LOGIN_IP_MAX: 5,
    RATELIMIT_LOGIN_IP_WINDOW: 900, // 15 minutes
    RATELIMIT_LOGIN_EMAIL_MAX: 5,
    RATELIMIT_LOGIN_EMAIL_WINDOW: 3600, // 1 hour

    // Auth - Signup
    RATELIMIT_SIGNUP_IP_MAX: 5,
    RATELIMIT_SIGNUP_IP_WINDOW: 3600, // 1 hour
    RATELIMIT_SIGNUP_EMAIL_MAX: 5,
    RATELIMIT_SIGNUP_EMAIL_WINDOW: 3600, // 1 hour

    // Auth - Magic Link Request
    RATELIMIT_MAGIC_LINK_EMAIL_MAX: 5,
    RATELIMIT_MAGIC_LINK_EMAIL_WINDOW: 3600, // 1 hour
    RATELIMIT_MAGIC_LINK_IP_MAX: 15,
    RATELIMIT_MAGIC_LINK_IP_WINDOW: 3600, // 1 hour

    // Auth - Verify OTP
    OTP_MAX_ATTEMPTS: 5,
    OTP_LOCK_ON_MAX_ATTEMPTS: true,
    RATELIMIT_VERIFY_OTP_IP_MAX: 10,
    RATELIMIT_VERIFY_OTP_IP_WINDOW: 600, // 10 minutes
    RATELIMIT_VERIFY_OTP_EMAIL_MAX: 10,
    RATELIMIT_VERIFY_OTP_EMAIL_WINDOW: 600, // 10 minutes

    // Auth - Resend OTP
    RATELIMIT_RESEND_OTP_EMAIL_MAX: 3,
    RATELIMIT_RESEND_OTP_EMAIL_WINDOW: 3600, // 1 hour
    RATELIMIT_RESEND_OTP_IP_MAX: 10,
    RATELIMIT_RESEND_OTP_IP_WINDOW: 3600, // 1 hour
    RESEND_OTP_COOLDOWN: 60, // 60 seconds

    // Feed - Create Post
    RATELIMIT_CREATE_POST_USER_MAX: 6,
    RATELIMIT_CREATE_POST_USER_WINDOW: 7200, // 2 hours
    RATELIMIT_CREATE_POST_IP_MAX: 2,
    RATELIMIT_CREATE_POST_IP_WINDOW: 600, // 10 minutes

    // Feed - Like / Favorite (combined)
    RATELIMIT_LIKE_FAV_USER_MAX: 60,
    RATELIMIT_LIKE_FAV_USER_WINDOW: 60, // 1 minute

    // Feed - Search
    RATELIMIT_SEARCH_IP_MAX: 30,
    RATELIMIT_SEARCH_IP_WINDOW: 60, // 1 minute
    RATELIMIT_SEARCH_USER_MAX: 100,
    RATELIMIT_SEARCH_USER_WINDOW: 60, // 1 minute

    // Feed - Read Endpoints
    RATELIMIT_READ_IP_MAX: 120,
    RATELIMIT_READ_IP_WINDOW: 60, // 1 minute

    // Email (Resend)
    RESEND_API_KEY: loadEnv("RESEND_API_KEY"),
    EMAIL_FROM: loadEnv("EMAIL_FROM", "FitThreads <noreply@fitthreads.com>"),

    // OTP
    OTP_EXPIRY_SECONDS: parseInt(loadEnv("OTP_EXPIRY_SECONDS", "600")),
} as const;
export type Env = typeof env;

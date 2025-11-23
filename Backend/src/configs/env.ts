import { loadEnv } from "./loadEnv.js";


export function tokenExpiry() {
    const now = Math.floor(Date.now() / 1000);

    const accessTokenDuration = parseInt(loadEnv("JWT_ACCESS_TOKEN_EXPIRES_IN", "3600"), 10);
    const refreshTokenDuration = parseInt(loadEnv("JWT_REFRESH_TOKEN_EXPIRES_IN", "2592000"), 10);

    return {
        accessTokenExpiry: now + accessTokenDuration,
        refreshTokenExpiry: now + refreshTokenDuration,
        refreshTokenMaxAge: refreshTokenDuration,
    }
}

export const env = {
    NODE_ENV: loadEnv("NODE_ENV", "development"),
    PORT: parseInt(loadEnv("PORT", "3000")),

    DATABASE_URL: loadEnv("DATABASE_URL"),

    // FRONTEND_URL=https://fitthreads.com

    // // Redis (Upstash)
    // REDIS_URL: loadEnv("REDIS_URL"),
    // REDIS_TOKEN: loadEnv("REDIS_TOKEN"),

    // // JWT
    // JWT_SECRET: loadEnv("JWT_SECRET"),
    // JWT_ACCESS_TOKEN_EXPIRES_IN: loadEnv("JWT_ACCESS_TOKEN_EXPIRES_IN", "3600"),
    // JWT_REFRESH_TOKEN_EXPIRES_IN: loadEnv("JWT_REFRESH_TOKEN_EXPIRES_IN", "2592000"),

    // // Magic Link
    // MAGIC_LINK_SECRET: loadEnv("MAGIC_LINK_SECRET"),
    // MAGIC_LINK_EXPIRES_IN: parseInt(loadEnv("MAGIC_LINK_EXPIRES_IN", "900")),

    // // Rate Limiting
    // RATE_LIMIT_POSTS_PER_HOUR: parseInt(loadEnv("RATE_LIMIT_POSTS_PER_HOUR", "6")),
    // RATE_LIMIT_LIKES_PER_MINUTE: parseInt(loadEnv("RATE_LIMIT_LIKES_PER_MINUTE", "100")),

    // Email (for magic links - add when implementing)
    // EMAIL_FROM: loadEnv("EMAIL_FROM"),
    // EMAIL_SERVICE_API_KEY: loadEnv("EMAIL_SERVICE_API_KEY"),
} as const;
export type Env = typeof env;

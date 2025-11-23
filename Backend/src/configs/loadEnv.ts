import "./initDotenv.js";

export const loadEnv = (env: string, fallback?: string): string => {
    const value = process.env[env];

    if (value !== undefined) return value
    if (fallback !== undefined) return fallback

    throw new Error(
        `Environment variable "${env}" is required but not defined. Please check your .env file.`
    );
};




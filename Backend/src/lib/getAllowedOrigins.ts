import { loadEnv } from "../configs/loadEnv.js";


export const getAllowedOrigins = (): string[] => {
    const isDev = loadEnv("NODE_ENV", "development") !== "production";

    if (isDev) {
        return [
            "http://localhost:5173",
            "http://localhost:4173",
            "http://127.0.0.1:5173",
            "http://127.0.0.1:4173",
        ];
    }

    const frontendUrl = loadEnv("FRONTEND_URL");
    return [frontendUrl];
};

import { Hono } from "hono";
import { globalErrorHandler } from "./middleware/globalErrorHandler.js";
import { cors } from "hono/cors";
import { getAllowedOrigins } from "./lib/getAllowedOrigins.js";
import { secureHeaders } from "hono/secure-headers";
import { registerRoute } from "./features/routes/index.js";

export const createApp = () => {
    const app = new Hono();
    const allowedOrigins = getAllowedOrigins();

    app.onError(globalErrorHandler);
    app.use(
        cors({
            origin: (origin) => {
                if (!origin) return null;
                return allowedOrigins.includes(origin) ? origin : null;
            },
            credentials: true,
            allowHeaders: [
                "Content-Type",
                "Authorization",
                "X-CSRF-Token",
                "X-Fingerprint",
                "Accept",
                "Accept-Language",
            ],

            exposeHeaders: [
                "X-RateLimit-Limit",
                "X-RateLimit-Remaining",
                "X-RateLimit-Reset",
            ],
            allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
            maxAge: 86400,
        })
    );
    app.use(
        secureHeaders({
            xFrameOptions: "DENY",
            xContentTypeOptions: "nosniff",
            referrerPolicy: "strict-origin-when-cross-origin",
            strictTransportSecurity: "max-age=31536000; includeSubDomains; preload",
        })
    );

    registerRoute(app)

    app.notFound((c) => c.json({ error: { message: 'Route not found', code: 'NOT_FOUND' } }, 404));
    return app;
};



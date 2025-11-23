import { serve } from "@hono/node-server";
import logger from "./lib/logger.js";
import { env } from "./configs/env.js";
import { createApp } from "./createApp.js";
import { handleGracefulShutdown } from "./lib/shutdown.js";

const app = createApp();
handleGracefulShutdown()

serve({ fetch: app.fetch, port: env.PORT }, (info) => {
    logger.info({ port: info.port, env: env.NODE_ENV }, `Server started on http://localhost:${info.port}`);
});

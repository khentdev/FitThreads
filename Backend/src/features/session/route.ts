import { Hono } from "hono";
import { validateLogoutSession, validateSession } from "./middleware.js";
import { logoutController, refreshSessionController } from "./controller.js";

const sessionRoutes = new Hono().basePath("/auth")
sessionRoutes.post("/session/refresh", validateSession, refreshSessionController).
    post("/session/logout", validateLogoutSession, logoutController)

export default sessionRoutes

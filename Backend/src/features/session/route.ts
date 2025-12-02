import { Hono } from "hono";
import { validateSession } from "./middleware.js";
import { refreshSessionController } from "./controller.js";

const sessionRoutes = new Hono().basePath("/auth")
sessionRoutes.post("/session/refresh", validateSession, refreshSessionController)

export default sessionRoutes

import { Hono } from "hono";
import authRouter from "../auth/route.js";
import sessionRoutes from "../session/route.js";
import feedRoutes from "../feed/route.js";
import profileRoutes from "../profile/route.js";

export const registerRoute = (app: Hono) => {
    app.get("/", (c) => c.redirect("/health-ping"));
    app.get("/health-ping", (c) => c.json({ status: "ok" }, 200));

    app.route("/", authRouter);
    app.route("/", sessionRoutes);
    app.route("/", feedRoutes);
    app.route("/profile", profileRoutes);
}
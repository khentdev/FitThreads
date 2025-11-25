import { Hono } from "hono";
import authRouter from "../auth/route.js";

export const registerRoute = (app: Hono) => {
    app.get("/", (c) => c.redirect("/health-ping"));
    app.get("/health-ping", (c) => c.json({ status: "ok" }, 200));
    app.route("/", authRouter);
}
import { Context, Hono } from "hono";
import { serve } from "@hono/node-server";
import { prisma } from "../prisma/prismaConfig.js";
import dotenv from "dotenv";
dotenv.config({ quiet: true });
const app = new Hono();


app.get("/posts", async (c: Context) => {
    const posts = await prisma.post.findMany();
    return c.json(posts);
})

serve({ fetch: app.fetch, port: 3000 }, (info) => {
    console.log(`Listening on http://localhost:${info.port}`);
});

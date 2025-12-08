import { Hono } from "hono";
import { verifyToken } from "../../middleware/validateAccessToken.js";
import { validateCreatingPost } from "./middlewares.js";
import { createPostController, getFeedController } from "./controller.js";

const feedRoutes = new Hono().basePath("/feed");

feedRoutes.get("/", getFeedController);

feedRoutes
    .use(verifyToken)
    .post("/create-post", validateCreatingPost, createPostController);

export default feedRoutes;
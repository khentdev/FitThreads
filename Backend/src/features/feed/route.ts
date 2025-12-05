import { Hono } from "hono";
import { verifyToken } from "../../middleware/validateAccessToken.js";
import { validateCreatingPost } from "./middlewares.js";
import { CreatePostController } from "./controller.js";

const feedRoutes = new Hono().basePath("/feed")
feedRoutes.use("*", verifyToken)
feedRoutes.post("/create-post", validateCreatingPost, CreatePostController)

export default feedRoutes
import { Hono } from "hono";
import { verifyToken } from "../../middleware/validateAccessToken.js";
import { verifyOptionalToken } from "../../middleware/validateOptionalAccessToken.js";
import { validateCreatingPost } from "./middlewares.js";
import { createPostController, getFeedController, getFavoritedPostsController, toggleLikeController, toggleFavoriteController } from "./controller.js";

const feedRoutes = new Hono().basePath("/feed");

feedRoutes.get("/", verifyOptionalToken, getFeedController)
feedRoutes.get("/favorites", getFavoritedPostsController)

feedRoutes
    .use(verifyToken)
    .post("/create-post", validateCreatingPost, createPostController)
    .post("/:postId/like", toggleLikeController)
    .post("/:postId/favorite", toggleFavoriteController)


export default feedRoutes;
import { Hono } from "hono";
import { verifyToken } from "../../middleware/validateAccessToken.js";
import { verifyOptionalToken } from "../../middleware/validateOptionalAccessToken.js";
import { rateLimitGetFavoritePosts, rateLimitGetFeed, rateLimitGetProfilePosts, rateLimitLikeFavoritePost, rateLimitSearch, validateCreatingPost } from "./middlewares.js";
import { createPostController, getFeedController, getFavoritedPostsController, toggleLikeController, toggleFavoriteController } from "./controller.js";

const feedRoutes = new Hono().basePath("/feed");

feedRoutes.get("/", verifyOptionalToken, rateLimitSearch, rateLimitGetProfilePosts, rateLimitGetFeed, getFeedController)
feedRoutes.get("/favorites", verifyOptionalToken, rateLimitGetFavoritePosts, getFavoritedPostsController)
feedRoutes
    .use(verifyToken)
    .post("/create-post", validateCreatingPost, createPostController)
    .post("/:postId/like", rateLimitLikeFavoritePost, toggleLikeController)
    .post("/:postId/favorite", rateLimitLikeFavoritePost, toggleFavoriteController)


export default feedRoutes;
import { Hono } from "hono";
import { rateLimitProfileSearch, validateUsernameParam } from "./middlewares.js";
import { getUserProfileController, searchProfilesController, updateProfileController } from "./controller.js";
import { verifyToken } from "../../middleware/validateAccessToken.js";

const profileRoutes = new Hono();
profileRoutes.get("/search",rateLimitProfileSearch, searchProfilesController);
profileRoutes.get("/:username", validateUsernameParam, getUserProfileController)
    .put("/update", verifyToken, updateProfileController)

export default profileRoutes;

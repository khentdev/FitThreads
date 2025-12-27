import { Hono } from "hono";
import { validateUsernameParam } from "./middlewares.js";
import { getUserProfileController, searchProfilesController, updateProfileController } from "./controller.js";
import { verifyToken } from "../../middleware/validateAccessToken.js";

const profileRoutes = new Hono();
profileRoutes.get("/search", searchProfilesController);
profileRoutes.get("/:username", validateUsernameParam, getUserProfileController)
    .put("/update", verifyToken, updateProfileController)

export default profileRoutes;

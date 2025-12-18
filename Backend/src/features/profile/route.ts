import { Hono } from "hono";
import { validateUsernameParam } from "./middlewares.js";
import { getUserProfileController, searchProfilesController } from "./controller.js";

const profileRoutes = new Hono();
profileRoutes.get("/search", searchProfilesController);
profileRoutes.get("/:username", validateUsernameParam, getUserProfileController);

export default profileRoutes;

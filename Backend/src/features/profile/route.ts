import { Hono } from "hono";
import { validateUsernameParam } from "./middlewares.js";
import { getUserProfileController } from "./controller.js";

const profileRoutes = new Hono();
profileRoutes.get("/:username", validateUsernameParam, getUserProfileController);

export default profileRoutes;

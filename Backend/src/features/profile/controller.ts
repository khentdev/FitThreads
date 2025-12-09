import { Context } from "hono";
import { getUserProfileService } from "./service.js";

export const getUserProfileController = async (c: Context) => {
    const username = c.req.param("username")
    const result = await getUserProfileService(username)
    return c.json(result, 200)
}

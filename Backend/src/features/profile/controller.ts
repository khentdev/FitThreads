import { Context } from "hono";
import { getUserProfileService, searchProfilesService, updateProfileService } from "./service.js";
import { VerifyTokenVariables } from "../../middleware/validateAccessToken.js";

export const getUserProfileController = async (c: Context) => {
    const username = c.req.param("username")
    const result = await getUserProfileService(username)
    return c.json(result, 200)
}

export const searchProfilesController = async (c: Context) => {
    const searchQuery = c.req.query("searchQuery") || ""
    const cursor = c.req.query("cursor") || ""
    const rawLimit = c.req.query("limit") || ""
    const limit = Math.min(Math.max(Number(rawLimit) || 20, 1), 20);

    const result = await searchProfilesService(searchQuery, limit, cursor)
    return c.json(result, 200)
}

export const updateProfileController = async (c: Context<{ Variables: VerifyTokenVariables }>) => {
    const { user } = c.get("verifyTokenVariables")
    const { bio } = await c.req.json()

    const result = await updateProfileService({ username: user.username, bio })
    return c.json(result, 200)
}

import { Context, Next } from "hono";
import { AppError } from "../../errors/customError.js";

export const validateUsernameParam = async (c: Context, next: Next) => {
    const username = c.req.param("username")
    const usernameRegex = /^[a-z0-9_]{3,30}$/
    if (!username || !usernameRegex.test(username)) {
        throw new AppError("INVALID_USERNAME_FORMAT", {
            field: "username"
        });
    }
    await next();
};

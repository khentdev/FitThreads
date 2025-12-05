import { Context, Next } from "hono"
import { AppError } from "../errors/customError.js"
import { verifyTokenOrThrow } from "../features/session/tokens.js"
import { prisma } from "../../prisma/prismaConfig.js"
import { User } from "../../generated/prisma/client.js"


export type VerifyTokenVariables = { verifyTokenVariables: { user: User } }
export const verifyToken = async (c: Context, next: Next) => {
    const header = c.req.header("Authorization")
    const token = header?.startsWith("Bearer ") ? header?.split(" ")[1] : undefined
    if (!token) throw new AppError("TOKEN_INVALID", { field: "access_token" })

    const payload = await verifyTokenOrThrow(token)
    const user = await prisma.user.findUnique({
        where: {
            id: payload.userId
        }
    })
    if (!user) throw new AppError("AUTH_USER_NOT_FOUND", { field: "access_token" })
    c.set("verifyTokenVariables", { user })
    await next()
}
import { Context, Next } from "hono"
import { verifyTokenOrThrow } from "../features/session/tokens.js"
import { prisma } from "../../prisma/prismaConfig.js"

export type OptionalVerifyTokenVariables = {
    optionalVerifyTokenVariables?: {
        userId: string
    }
}

export const verifyOptionalToken = async (c: Context, next: Next): Promise<void> => {
    const header = c.req.header("Authorization")
    const token = header?.startsWith("Bearer ") ? header?.split(" ")[1] : undefined

    if (!token) {
        await next()
        return
    }

    try {
        const payload = await verifyTokenOrThrow(token)
        const user = await prisma.user.findUnique({
            where: { id: payload.userId }
        })

        if (user) {
            c.set("optionalVerifyTokenVariables", { userId: user.id })
        }
    } catch {
    }

    await next()
}

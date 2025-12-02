import { Prisma, prisma } from "../../../prisma/prismaConfig.js";
import { StoreTokenParams } from "./types.js";

export const storeToken = async ({ userId, token, expiresAt }: StoreTokenParams, tx?: Prisma.TransactionClient) => {
    const client = tx ?? prisma
    return await client.session.create({ data: { userId, token, expiresAt } })
}
export const invalidateToken = async (userId: string, tx?: Prisma.TransactionClient) => {
    const client = tx ?? prisma
    return await client.session.deleteMany({ where: { userId } })
}
export const findToken = async (token: string, tx?: Prisma.TransactionClient) => {
    const client = tx ?? prisma
    return await client.session.findUnique({ where: { token } })
}

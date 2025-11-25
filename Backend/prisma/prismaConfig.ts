import { PrismaClient ,Prisma} from "../generated/prisma/client.js"
import { PrismaPg } from '@prisma/adapter-pg'
import { env } from "../src/configs/env.js";

const connectionString = env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter });
export { prisma, PrismaClient ,Prisma};
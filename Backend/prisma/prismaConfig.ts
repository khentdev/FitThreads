import { PrismaClient } from "../generated/prisma/client.js"
import { PrismaPg } from '@prisma/adapter-pg'
import dotenv from "dotenv";
dotenv.config({quiet: true});

const connectionString = `${process.env['DATABASE_URL']}`
const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter });
export { prisma };
import { prisma } from "../../prisma/prismaConfig.js";
import logger from "./logger.js";
import { stopJobs } from "../jobs/index.js";

const shutdown = async (signal: string) => {
    try {
        logger.debug(`Signal Received: ${signal} - Shutting down gracefully...`);
        stopJobs()
        await prisma.$disconnect();
        process.exit(0);
    } catch (err) {
        logger.error({ err }, 'Error during graceful shutdown:');
        process.exit(1);
    }
}

export const handleGracefulShutdown = () => {
    const signals = ['SIGINT', 'SIGTERM', 'SIGUSR1'];
    signals.forEach((signal) => {
        process.once(signal, async () => await shutdown(signal));
    });
    process.on('unhandledRejection', async (reason) => {
        logger.error({ reason }, 'Unhandled promise rejection');
        await shutdown('UNHANDLED_REJECTION');
    });

    process.on('uncaughtException', async (err) => {
        logger.error({ err }, 'Uncaught exception');
        await shutdown('UNCAUGHT_EXCEPTION');
    });
}
import { prisma } from "../../prisma/prismaConfig.js";
import logger from "./logger.js";

const shutdown = async (signal: string) => {
    try {
        logger.debug(`Signal Received: ${signal} - Shutting down gracefully...`);
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
        process.once(signal, () => shutdown(signal));
    });
    process.on('unhandledRejection', (reason) => {
        logger.error({ reason }, 'Unhandled promise rejection');
        shutdown('UNHANDLED_REJECTION');
    });

    process.on('uncaughtException', (err) => {
        logger.error({ err }, 'Uncaught exception');
        shutdown('UNCAUGHT_EXCEPTION');
    });
}
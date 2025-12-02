import { prisma } from "../../prisma/prismaConfig.js";
import logger from "../lib/logger.js";
export const startSessionCleanupWorker = () => {
    const CLEANUP_INTERVAL = 5 * 60 * 1000;
    const BATCH_SIZE = 100;
    let stopped = false;
    let interval: NodeJS.Timeout | null = null;
    let timeout: NodeJS.Timeout | null = null;

    const cleanupWorker = async () => {
        if (stopped) return;

        try {
            const now = new Date();
            const queuedSessions = await prisma.tokenCleanupQueue.findMany({
                where: { cleanupAt: { lte: now } },
                take: BATCH_SIZE,
                orderBy: { createdAt: 'asc' }
            });
            const expiredSessions = await prisma.session.findMany({
                where: { expiresAt: { lte: now } },
                take: BATCH_SIZE,
                orderBy: { expiresAt: 'asc' }
            });
            const totalToCleanup = queuedSessions.length + expiredSessions.length;
            if (totalToCleanup === 0) {
                logger.debug("No sessions to cleanup at this time");
                return;
            }
            logger.info({
                queuedSessions: queuedSessions.length,
                expiredSessions: expiredSessions.length,
                total: totalToCleanup
            }, "Starting session cleanup batch");

            const queuedResults = await Promise.allSettled(
                queuedSessions.map(async (item) => {
                    try {
                        await prisma.$transaction(async (tx) => {
                            await tx.session.deleteMany({
                                where: {
                                    userId: item.userId,
                                    token: item.hashedToken
                                }
                            });
                            await tx.tokenCleanupQueue.delete({
                                where: { id: item.id }
                            });
                        });
                        logger.debug({
                            userId: item.userId,
                            tokenHash: item.hashedToken.slice(0, 8),
                            type: 'queued'
                        }, "Queued session cleaned up");
                        return { success: true, userId: item.userId };
                    } catch (err) {
                        logger.warn({
                            error: err,
                            userId: item.userId,
                            type: 'queued'
                        }, "Queued session cleanup failed");
                        return { success: false, userId: item.userId, error: err };
                    }
                })
            );
            const expiredResults = await Promise.allSettled(
                expiredSessions.map(async (session) => {
                    try {
                        await prisma.session.delete({
                            where: { id: session.id }
                        });
                        logger.debug({
                            userId: session.userId,
                            sessionId: session.id,
                            expiredAt: session.expiresAt,
                            type: 'expired'
                        }, "Expired session cleaned up");
                        return { success: true, userId: session.userId };
                    } catch (err) {
                        logger.warn({
                            error: err,
                            userId: session.userId,
                            type: 'expired'
                        }, "Expired session cleanup failed");
                        return { success: false, userId: session.userId, error: err };
                    }
                })
            );
            const queuedSuccess = queuedResults.filter(r => r.status === 'fulfilled').length;
            const expiredSuccess = expiredResults.filter(r => r.status === 'fulfilled').length;
            const totalSuccess = queuedSuccess + expiredSuccess;
            const totalFailed = totalToCleanup - totalSuccess;
            logger.info({
                queuedSuccess,
                queuedFailed: queuedSessions.length - queuedSuccess,
                expiredSuccess,
                expiredFailed: expiredSessions.length - expiredSuccess,
                totalSuccess,
                totalFailed
            }, "Session cleanup batch completed");
        } catch (err) {
            logger.error({ error: err }, "Session cleanup worker failed");
        }
    };
    const start = () => {
        stopped = false;
        const initialDelay = Math.floor(Math.random() * 5000);
        interval = setInterval(cleanupWorker, CLEANUP_INTERVAL);
        timeout = setTimeout(cleanupWorker, initialDelay);

        logger.info({
            interval: CLEANUP_INTERVAL,
            batchSize: BATCH_SIZE
        }, "Session cleanup worker started");
    };
    const stop = () => {
        stopped = true;
        if (interval) clearInterval(interval);
        if (timeout) clearTimeout(timeout);
        logger.info("Session cleanup worker stopped");
    };

    return { stop, start };
};
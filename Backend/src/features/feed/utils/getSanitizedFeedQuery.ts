import { Context } from 'hono';
import logger from '../../../lib/logger.js';
import { decodeCursor } from './cursor.js';

export const getSanitizedFeedQuery = (c: Context) => {
    const rawCursor = c.req.query('cursor');
    const cursor = decodeCursor(rawCursor);

    const rawLimit = c.req.query('limit');
    const limit = Math.min(Math.max(Number(rawLimit) || 20, 1), 20);

    logger.debug({ cursor, limit }, "Received queries: ");
    return { cursor, limit };
};
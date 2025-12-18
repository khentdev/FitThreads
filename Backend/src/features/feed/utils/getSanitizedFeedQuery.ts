import { Context } from 'hono';
import logger from '../../../lib/logger.js';
import { decodeCursor } from '../../../lib/cursor.js';

export const getSanitizedFeedQuery = (c: Context) => {
    const rawCursor = c.req.query('cursor');
    const cursor = decodeCursor(rawCursor);

    const rawLimit = c.req.query('limit');
    const limit = Math.min(Math.max(Number(rawLimit) || 20, 1), 20);

    const sortBy = c.req.query('sortBy') as 'recent' | 'top' | undefined;
    const rawSearch = c.req.query('search');
    const search = toSafeTsquery(rawSearch);
    const username = c.req.query('username');

    logger.debug({ cursor, limit, sortBy, search, username }, "Received queries: ");
    return { cursor, limit, sortBy, search, username };
};

export const toSafeTsquery = (raw: string | undefined) => {
    if (!raw || !raw.trim()) return undefined;

    const words = raw
        .replace(/[':()&|!@#$%^*+=\[\]{}\\<>?/;,"~`]/g, ' ')
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 10);

    if (words.length === 0) return undefined;

    const terms = words.map((word, idx) => {
        const clean = word.replace(/[^\w.+'-]/g, '');
        if (!clean) return null;

        const isLastIdx = idx === words.length - 1;
        return isLastIdx ? `${clean}:*` : clean;
    }).filter(Boolean);

    if (terms.length === 0) return undefined;

    return terms.join(' & ');
};
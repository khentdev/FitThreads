import logger from "../../../lib/logger.js";

export type FeedCursor = {
    id: string;
    createdAt: Date;
};

export const encodeCursor = (cursor: FeedCursor): string => {
    const json = JSON.stringify(cursor);
    return Buffer.from(json).toString('base64url');
}

export const decodeCursor = (input?: string): FeedCursor | undefined => {
    if (!input) return undefined;

    try {
        const json = Buffer.from(input, 'base64url').toString('utf8');
        const parsed: FeedCursor = JSON.parse(json);

        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(parsed.id))
            throw new Error('Invalid UUID');

        if (typeof parsed.createdAt !== 'string')
            throw new Error('Invalid createdAt');

        if (isNaN(Date.parse(parsed.createdAt)))
            throw new Error('Invalid createdAt');


        return {
            id: parsed.id,
            createdAt: new Date(parsed.createdAt)
        };
    } catch (err) {
        logger.warn({ error: err }, 'Invalid feed cursor:');
        return undefined;
    }
};

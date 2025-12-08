import logger from "../../../lib/logger.js";


export type Cursor = {
    createdAt: string
    id: string;
};

export const encodeCursor = (cursor: Cursor): string => {
    const json = JSON.stringify(cursor);
    return Buffer.from(json).toString('base64url');
}

export const decodeCursor = (input?: string): Cursor | undefined => {
    if (!input) return undefined;

    try {
        const json = Buffer.from(input, 'base64url').toString('utf8');
        const parsed: Cursor = JSON.parse(json);

        const date = new Date(parsed.createdAt);
        if (isNaN(date.getTime())) throw new Error('Invalid date');
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(parsed.id))
            throw new Error('Invalid UUID');

        return { createdAt: parsed.createdAt, id: parsed.id };
    } catch (err) {
        logger.warn({ error: err }, 'Invalid cursor:');
        return undefined;
    }
};
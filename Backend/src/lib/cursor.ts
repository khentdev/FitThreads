import logger from "./logger.js";

export type Cursor = {
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

        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(parsed.id))
            throw new Error('Invalid UUID');

        return { id: parsed.id };
    } catch (err) {
        logger.warn({ error: err }, 'Invalid cursor:');
        return undefined;
    }
};

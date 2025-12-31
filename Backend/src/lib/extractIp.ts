import { Context } from "hono";


export const getClientIp = (c: Context): string => {
    const cfIp = c.req.header('cf-connecting-ip');
    if (cfIp) return cfIp;

    const trueIp = c.req.header('true-client-ip');
    if (trueIp) return trueIp;

    const forwardedFor = c.req.header('x-forwarded-for');
    if (forwardedFor)
        return forwardedFor.split(',')[0].trim();

    return 'unknown';
}
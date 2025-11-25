import { Context } from 'hono';
import { setCookie, getCookie, deleteCookie } from 'hono/cookie';
import { env } from "../../configs/env.js"
import type { CookieOptions } from "hono/utils/cookie";

type CookieOptionsParams = {
    context: "auth" | "csrf"
    maxAge?: number
}

type CookieNames =  "sid" | "csrfToken"
type CookieParams = {
    c: Context;
    name: CookieNames;
    value: string;
    options: Pick<CookieOptionsParams, "maxAge">;
};

const createCookieOptions = ({ context, maxAge }: CookieOptionsParams): CookieOptions => {
    const isProd = env.NODE_ENV === "production"
    return {
        path: "/",
        secure: isProd,
        httpOnly: context === "auth",
        sameSite: isProd ? "none" : "lax",
        maxAge,
        prefix: isProd ? "secure" : undefined,
    }
}

export const setAuthCookie = ({ c, name, value, options }: CookieParams) =>
    setCookie(c, name, value, createCookieOptions({ context: "auth", ...options }))
export const setCSRFCookie = ({ c, name, value, options }: CookieParams) =>
    setCookie(c, name, value, createCookieOptions({ context: "csrf", ...options }))

export const getCookieValue = (c: Context, name: CookieNames) => getCookie(c, name);
export const deleteAuthCookie = (c: Context, name: CookieNames) => deleteCookie(c, name, { path: "/", secure: env.NODE_ENV === "production", sameSite: env.NODE_ENV === "production" ? "none" : "lax" });
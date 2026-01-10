import { Context } from 'hono';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import type { CookieOptions } from "hono/utils/cookie";
import { env } from "../../configs/env.js";

type CookieOptionsParams = {
    context: "auth" | "csrf"
    maxAge?: number
}

type CookieNames = "sid" | "csrfToken"
type CookieParams = {
    c: Context;
    name: CookieNames;
    value: string;
    options: Pick<CookieOptionsParams, "maxAge">;
};
const isProd = () => env.NODE_ENV === "production"
const createCookieOptions = ({ context, maxAge }: CookieOptionsParams): CookieOptions => {
    return {
        domain: isProd() ? ".fitthreads.blog" : undefined,
        path: "/",
        secure: isProd(),
        httpOnly: context === "auth",
        sameSite: "lax",
        maxAge,
        prefix: isProd() ? "secure" : undefined,
    }
}

export const setAuthCookie = ({ c, name, value, options }: CookieParams) =>
    setCookie(c, name, value, createCookieOptions({ context: "auth", ...options }))
export const setCSRFCookie = ({ c, name, value, options }: CookieParams) =>
    setCookie(c, name, value, createCookieOptions({ context: "csrf", ...options }))

export const getCookieValue = (c: Context, name: any) => getCookie(c, name);
export const deleteAuthCookie = (c: Context, name: any) => deleteCookie(c, name, {
    path: "/",
    domain: isProd() ? ".fitthreads.blog" : undefined,
    secure: isProd(),
    sameSite: "lax",
})
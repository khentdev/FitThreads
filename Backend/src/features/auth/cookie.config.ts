import { Context } from 'hono';
import { setCookie, getCookie, deleteCookie } from 'hono/cookie';
import { env } from "../../configs/env.js"
import type { CookieOptions } from "hono/utils/cookie";

type CookieOptionsParams = {
    context: "auth" | "csrf"
    maxAge?: number
}

type CookieNames = "sid" | "csrfToken"
type CookieParams = {

export const getCookieValue = (c: Context, name: any) => getCookie(c, name);
export const deleteAuthCookie = (c: Context, name: any) => deleteCookie(c, name, { path: "/", secure: env.NODE_ENV === "production", sameSite: env.NODE_ENV === "production" ? "none" : "lax" });
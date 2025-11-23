import { ErrorDefinitions } from "../../errors/index.js";

export const AUTH_ERROR_CODES = {
    AUTH_INVALID_CREDENTIALS: "AUTH_INVALID_CREDENTIALS",
    AUTH_USER_NOT_FOUND: "AUTH_USER_NOT_FOUND"
} as const

export const AUTH_ERROR_DEF: Record<AuthErrorCode, ErrorDefinitions> = {
    AUTH_INVALID_CREDENTIALS: {
        code: "AUTH_INVALID_CREDENTIALS",
        status: 401,
        message: "Invalid email or password",
    },
    AUTH_USER_NOT_FOUND: {
        code: "AUTH_USER_NOT_FOUND",
        status: 404,
        message: "User not found",
    },
}
export type AuthErrorCode = keyof typeof AUTH_ERROR_CODES

import { ErrorDefinitions } from "../../errors/index.js";

export const SESSION_ERROR_CODES = {
    TOKEN_INVALID: "TOKEN_INVALID",
    TOKEN_EXPIRED: "TOKEN_EXPIRED"
} as const

export const SESSION_ERROR_DEF: Record<SessionErrorCode, ErrorDefinitions> = {
    TOKEN_INVALID: {
        code: "TOKEN_INVALID",
        status: 401,
        message: "Invalid or malformed token."
    },
    TOKEN_EXPIRED: {
        code: "TOKEN_EXPIRED",
        status: 401,
        message: "Token has expired."
    }
}
export type SessionErrorCode = keyof typeof SESSION_ERROR_CODES

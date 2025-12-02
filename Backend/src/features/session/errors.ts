import { ErrorDefinitions } from "../../errors/index.js";


export const SESSION_ERROR_CODES = {
    SESSION_UNAUTHORIZED: "SESSION_UNAUTHORIZED",

    SESSION_REFRESH_FAILED: "SESSION_REFRESH_FAILED",
    SESSION_LOCK_IN_PROGRESS: "SESSION_LOCK_IN_PROGRESS",
    TOKEN_INVALID: "TOKEN_INVALID",
    TOKEN_EXPIRED: "TOKEN_EXPIRED"
} as const

export const SESSION_ERROR_DEF: Record<SessionErrorCode, ErrorDefinitions> = {

    SESSION_UNAUTHORIZED: {
        code: "SESSION_UNAUTHORIZED",
        status: 401,
        message: "Your session is invalid or has expired. Please log in again."
    },
    SESSION_REFRESH_FAILED: {
        code: "SESSION_REFRESH_FAILED",
        status: 500,
        message: "We couldn't refresh your session. Please log in again."
    },
    SESSION_LOCK_IN_PROGRESS: {
        code: "SESSION_LOCK_IN_PROGRESS",
        status: 429,
        message: "Your session is currently being refreshed. Please try again later."
    },


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

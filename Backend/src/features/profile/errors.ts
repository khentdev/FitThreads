import { ErrorDefinitions } from "../../errors/index.js";

export const PROFILE_ERROR_CODES = {
    INVALID_USERNAME_FORMAT: "INVALID_USERNAME_FORMAT",
    USER_NOT_FOUND: "USER_NOT_FOUND",
    PROFILE_RETRIEVAL_FAILED: "PROFILE_RETRIEVAL_FAILED",
} as const

export const PROFILE_ERROR_DEF: Record<ProfileErrorCode, ErrorDefinitions> = {
    INVALID_USERNAME_FORMAT: {
        code: "INVALID_USERNAME_FORMAT",
        status: 400,
        message: "Username must be 3-30 characters (letters, numbers, underscores only)."
    },
    USER_NOT_FOUND: {
        code: "USER_NOT_FOUND",
        status: 404,
        message: "User not found."
    },
    PROFILE_RETRIEVAL_FAILED: {
        code: "PROFILE_RETRIEVAL_FAILED",
        status: 500,
        message: "Failed to retrieve profile. Please try again."
    },
}

export type ProfileErrorCode = keyof typeof PROFILE_ERROR_CODES

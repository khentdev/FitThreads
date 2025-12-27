import { ErrorDefinitions } from "../../errors/index.js";

export const PROFILE_ERROR_CODES = {
    INVALID_USERNAME_FORMAT: "INVALID_USERNAME_FORMAT",
    USER_NOT_FOUND: "USER_NOT_FOUND",
    PROFILE_RETRIEVAL_FAILED: "PROFILE_RETRIEVAL_FAILED",
    PROFILE_SEARCH_FAILED: "PROFILE_SEARCH_FAILED",
    PROFILE_UPDATE_FAILED: "PROFILE_UPDATE_FAILED",
    INVALID_PROFILE_BIO: "INVALID_PROFILE_BIO",
    PROFILE_BIO_LENGTH_EXCEEDED: "PROFILE_BIO_LENGTH_EXCEEDED"
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
    PROFILE_SEARCH_FAILED: {
        code: "PROFILE_SEARCH_FAILED",
        status: 500,
        message: "Failed to search profiles. Please try again."
    },
    PROFILE_UPDATE_FAILED: {
        code: "PROFILE_UPDATE_FAILED",
        status: 500,
        message: "Failed to update profile. Please try again."
    },
    INVALID_PROFILE_BIO: {
        code: "INVALID_PROFILE_BIO",
        status: 400,
        message: "Invalid profile bio."
    },
    PROFILE_BIO_LENGTH_EXCEEDED: {
        code: "PROFILE_BIO_LENGTH_EXCEEDED",
        status: 400,
        message: "Keep your bio under 100 characters - short and authentic."
    }
}

export type ProfileErrorCode = keyof typeof PROFILE_ERROR_CODES

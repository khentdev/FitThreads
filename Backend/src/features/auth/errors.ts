import { ErrorDefinitions } from "../../errors/index.js";

export const AUTH_ERROR_CODES = {
    // Middleware Validation Errors (Request Input)
    AUTH_USERNAME_REQUIRED: "AUTH_USERNAME_REQUIRED",
    AUTH_USERNAME_MAX_LENGTH: "AUTH_USERNAME_MAX_LENGTH",
    AUTH_USERNAME_INVALID_FORMAT: "AUTH_USERNAME_INVALID_FORMAT",
    AUTH_EMAIL_REQUIRED: "AUTH_EMAIL_REQUIRED",
    AUTH_PASSWORD_MIN_LENGTH: "AUTH_PASSWORD_MIN_LENGTH",
    AUTH_OTP_INVALID_FORMAT: "AUTH_OTP_INVALID_FORMAT",
    AUTH_INVALID_DEVICE_FINGERPRINT: "AUTH_INVALID_DEVICE_FINGERPRINT",

    // Service Layer - Business Logic Errors
    AUTH_USERNAME_ALREADY_TAKEN: "AUTH_USERNAME_ALREADY_TAKEN",
    AUTH_USER_ALREADY_EXISTS: "AUTH_USER_ALREADY_EXISTS",
    AUTH_USER_ALREADY_VERIFIED: "AUTH_USER_ALREADY_VERIFIED",
    AUTH_USER_NOT_FOUND: "AUTH_USER_NOT_FOUND",
    AUTH_INVALID_CREDENTIALS: "AUTH_INVALID_CREDENTIALS",
    AUTH_OTP_INVALID_OR_EXPIRED: "AUTH_OTP_INVALID_OR_EXPIRED",

    // Service Layer - System/Infrastructure Errors
    AUTH_ACCOUNT_CREATION_FAILED: "AUTH_ACCOUNT_CREATION_FAILED",
    AUTH_OTP_SEND_FAILED: "AUTH_OTP_SEND_FAILED",
} as const

export const AUTH_ERROR_DEF: Record<AuthErrorCode, ErrorDefinitions> = {

    AUTH_USERNAME_REQUIRED: {
        code: "AUTH_USERNAME_REQUIRED",
        status: 400,
        message: "Username is required to create your FitThreads account.",
    },
    AUTH_USERNAME_MAX_LENGTH: {
        code: "AUTH_USERNAME_MAX_LENGTH",
        status: 400,
        message: "Username must be 20 characters or fewer. Keep it short and memorable."
    },
    AUTH_USERNAME_INVALID_FORMAT: {
        code: "AUTH_USERNAME_INVALID_FORMAT",
        status: 400,
        message: "Username must be 2-20 characters and can only contain letters, numbers, dots, hyphens, and underscores."
    },
    AUTH_EMAIL_REQUIRED: {
        code: "AUTH_EMAIL_REQUIRED",
        status: 400,
        message: "Please provide a valid email address. We'll use it to verify your account.",
    },
    AUTH_PASSWORD_MIN_LENGTH: {
        code: "AUTH_PASSWORD_MIN_LENGTH",
        status: 400,
        message: "Password must be at least 8 characters.",
    },
    AUTH_OTP_INVALID_FORMAT: {
        code: "AUTH_OTP_INVALID_FORMAT",
        status: 400,
        message: "Verification code must be exactly 6 digits.",
    },
    AUTH_INVALID_DEVICE_FINGERPRINT: {
        code: "AUTH_INVALID_DEVICE_FINGERPRINT",
        status: 400,
        message: "Unable to verify your device. Please refresh the page and try again.",
    },


    AUTH_USERNAME_ALREADY_TAKEN: {
        code: "AUTH_USERNAME_ALREADY_TAKEN",
        status: 409,
        message: "This username is already taken. Try a different one."
    },
    AUTH_USER_ALREADY_EXISTS: {
        code: "AUTH_USER_ALREADY_EXISTS",
        status: 409,
        message: "An account with this email already exists. Try logging in instead.",
    },
    AUTH_USER_ALREADY_VERIFIED: {
        code: "AUTH_USER_ALREADY_VERIFIED",
        status: 409,
        message: "Your account is already verified. You can log in now.",
    },
    AUTH_USER_NOT_FOUND: {
        code: "AUTH_USER_NOT_FOUND",
        status: 404,
        message: "We couldn't find an account with those credentials.",
    },
    AUTH_INVALID_CREDENTIALS: {
        code: "AUTH_INVALID_CREDENTIALS",
        status: 401,
        message: "Email or password is incorrect. Double-check and try again.",
    },
    AUTH_OTP_INVALID_OR_EXPIRED: {
        code: "AUTH_OTP_INVALID_OR_EXPIRED",
        status: 401,
        message: "This verification code is invalid or has expired. Request a new one.",
    },


    AUTH_ACCOUNT_CREATION_FAILED: {
        code: "AUTH_ACCOUNT_CREATION_FAILED",
        status: 500,
        message: "We couldn't create your account right now. Please try again in a moment.",
    },
    AUTH_OTP_SEND_FAILED: {
        code: "AUTH_OTP_SEND_FAILED",
        status: 500,
        message: "We couldn't send your verification email. Please try again.",
    },
}
export type AuthErrorCode = keyof typeof AUTH_ERROR_CODES

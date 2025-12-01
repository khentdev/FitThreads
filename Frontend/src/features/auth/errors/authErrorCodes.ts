
// ============================================
// LOGIN ERROR CODES
// ============================================

// Validation errors (from middleware)
export const AUTH_USERNAME_REQUIRED = "AUTH_USERNAME_REQUIRED"
export const AUTH_PASSWORD_REQUIRED = "AUTH_PASSWORD_REQUIRED"
export const AUTH_PASSWORD_MIN_LENGTH = "AUTH_PASSWORD_MIN_LENGTH"
export const AUTH_INVALID_DEVICE_FINGERPRINT = "AUTH_INVALID_DEVICE_FINGERPRINT"

// Business logic errors (from service)
export const AUTH_INVALID_CREDENTIALS = "AUTH_INVALID_CREDENTIALS"
export const AUTH_USER_NOT_VERIFIED = "AUTH_USER_NOT_VERIFIED"

// Infrastructure errors (from service)
export const AUTH_LOGIN_FAILED = "AUTH_LOGIN_FAILED"
export const AUTH_OTP_SEND_FAILED = "AUTH_OTP_SEND_FAILED"

export type LoginErrorCode =
    | typeof AUTH_USERNAME_REQUIRED
    | typeof AUTH_PASSWORD_REQUIRED
    | typeof AUTH_PASSWORD_MIN_LENGTH
    | typeof AUTH_INVALID_DEVICE_FINGERPRINT
    | typeof AUTH_INVALID_CREDENTIALS
    | typeof AUTH_USER_NOT_VERIFIED
    | typeof AUTH_LOGIN_FAILED
    | typeof AUTH_OTP_SEND_FAILED

// ============================================
// SIGNUP ERROR CODES
// ============================================

// Validation errors (from middleware)
export const AUTH_USERNAME_MAX_LENGTH = "AUTH_USERNAME_MAX_LENGTH"
export const AUTH_USERNAME_INVALID_FORMAT = "AUTH_USERNAME_INVALID_FORMAT"
export const AUTH_EMAIL_REQUIRED = "AUTH_EMAIL_REQUIRED"

// Business logic errors (from service)
export const AUTH_USERNAME_ALREADY_TAKEN = "AUTH_USERNAME_ALREADY_TAKEN"
export const AUTH_USER_ALREADY_EXISTS = "AUTH_USER_ALREADY_EXISTS"
export const AUTH_USER_ALREADY_VERIFIED = "AUTH_USER_ALREADY_VERIFIED"

// Infrastructure errors (from service)
export const AUTH_ACCOUNT_CREATION_FAILED = "AUTH_ACCOUNT_CREATION_FAILED"

export type SignupErrorCode =
    | typeof AUTH_USERNAME_REQUIRED
    | typeof AUTH_USERNAME_MAX_LENGTH
    | typeof AUTH_USERNAME_INVALID_FORMAT
    | typeof AUTH_EMAIL_REQUIRED
    | typeof AUTH_PASSWORD_REQUIRED
    | typeof AUTH_PASSWORD_MIN_LENGTH
    | typeof AUTH_INVALID_DEVICE_FINGERPRINT
    | typeof AUTH_USERNAME_ALREADY_TAKEN
    | typeof AUTH_USER_ALREADY_EXISTS
    | typeof AUTH_USER_ALREADY_VERIFIED
    | typeof AUTH_ACCOUNT_CREATION_FAILED
    | typeof AUTH_OTP_SEND_FAILED

// ============================================
// OTP VERIFICATION ERROR CODES
// ============================================

// Validation errors (from middleware)
export const AUTH_OTP_INVALID_FORMAT = "AUTH_OTP_INVALID_FORMAT"

// Business logic errors (from service)
export const AUTH_OTP_INVALID_OR_EXPIRED = "AUTH_OTP_INVALID_OR_EXPIRED"
export const AUTH_USER_NOT_FOUND = "AUTH_USER_NOT_FOUND"

export type VerifyOTPErrorCode =
    | typeof AUTH_OTP_INVALID_FORMAT
    | typeof AUTH_INVALID_DEVICE_FINGERPRINT
    | typeof AUTH_OTP_INVALID_OR_EXPIRED
    | typeof AUTH_USER_NOT_FOUND
    | typeof AUTH_USER_ALREADY_VERIFIED
    | typeof AUTH_ACCOUNT_CREATION_FAILED

// ============================================
// RESEND OTP ERROR CODES
// ============================================

// Validation errors (from middleware)
// Uses AUTH_EMAIL_REQUIRED from Signup

// Business logic errors (from service)
// Uses AUTH_USER_NOT_FOUND from Verify OTP
// Uses AUTH_USER_ALREADY_VERIFIED from Signup

export type ResendOTPErrorCode =
    | typeof AUTH_EMAIL_REQUIRED
    | typeof AUTH_USER_NOT_FOUND
    | typeof AUTH_USER_ALREADY_VERIFIED
    | typeof AUTH_OTP_SEND_FAILED

// ============================================
// MAGIC LINK ERROR CODES
// ============================================

// Service Layer
export const AUTH_SEND_MAGICLINK_FAILED = "AUTH_SEND_MAGICLINK_FAILED"
export const AUTH_MAGIC_LINK_INVALID_OR_EXPIRED = "AUTH_MAGIC_LINK_INVALID_OR_EXPIRED"

export type SendMagicLinkErrorCode =
    | typeof AUTH_EMAIL_REQUIRED
    | typeof AUTH_USER_NOT_VERIFIED
    | typeof AUTH_SEND_MAGICLINK_FAILED

export type VerifyMagicLinkErrorCode =
    | typeof AUTH_MAGIC_LINK_INVALID_OR_EXPIRED
    | typeof AUTH_USER_NOT_FOUND
    | typeof AUTH_LOGIN_FAILED
    | typeof AUTH_INVALID_DEVICE_FINGERPRINT
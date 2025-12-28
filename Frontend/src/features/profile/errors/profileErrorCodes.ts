// ============================================
// PROFILE ERROR CODES
// ============================================

export const INVALID_USERNAME_FORMAT = "INVALID_USERNAME_FORMAT"
export const USER_NOT_FOUND = "USER_NOT_FOUND"
export const PROFILE_RETRIEVAL_FAILED = "PROFILE_RETRIEVAL_FAILED"

// Edit Profile Error Codes
export const PROFILE_UPDATE_FAILED = "PROFILE_UPDATE_FAILED"
export const INVALID_PROFILE_BIO = "INVALID_PROFILE_BIO"
export const PROFILE_BIO_LENGTH_EXCEEDED = "PROFILE_BIO_LENGTH_EXCEEDED"

export type ProfileErrorCode =
    | typeof INVALID_USERNAME_FORMAT
    | typeof USER_NOT_FOUND
    | typeof PROFILE_RETRIEVAL_FAILED
    | typeof PROFILE_UPDATE_FAILED
    | typeof INVALID_PROFILE_BIO
    | typeof PROFILE_BIO_LENGTH_EXCEEDED


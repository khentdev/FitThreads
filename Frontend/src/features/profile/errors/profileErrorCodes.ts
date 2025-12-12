// ============================================
// PROFILE ERROR CODES
// ============================================

export const INVALID_USERNAME_FORMAT = "INVALID_USERNAME_FORMAT"
export const USER_NOT_FOUND = "USER_NOT_FOUND"
export const PROFILE_RETRIEVAL_FAILED = "PROFILE_RETRIEVAL_FAILED"

export type ProfileErrorCode =
    | typeof INVALID_USERNAME_FORMAT
    | typeof USER_NOT_FOUND
    | typeof PROFILE_RETRIEVAL_FAILED

// ============================================
// FEED ERROR CODES
// ============================================

// Post Content Validation
export const TITLE_MIN_LENGTH = "TITLE_MIN_LENGTH"
export const TITLE_MAX_LENGTH = "TITLE_MAX_LENGTH"
export const CONTENT_MIN_LENGTH = "CONTENT_MIN_LENGTH"
export const CONTENT_MAX_LENGTH = "CONTENT_MAX_LENGTH"

// Post Tags Validation
export const POST_TAGS_INVALID = "POST_TAGS_INVALID"
export const POST_TAGS_LIMIT_EXCEEDED = "POST_TAGS_LIMIT_EXCEEDED"
export const POST_TAG_MIN_LENGTH = "POST_TAG_MIN_LENGTH"
export const POST_TAG_MAX_LENGTH = "POST_TAG_MAX_LENGTH"
export const POST_TAG_FORMAT_INVALID = "POST_TAG_FORMAT_INVALID"

// Service Layer Error
export const POST_CREATION_FAILED = "POST_CREATION_FAILED"

export type FeedErrorCode =
    | typeof TITLE_MIN_LENGTH
    | typeof TITLE_MAX_LENGTH
    | typeof CONTENT_MIN_LENGTH
    | typeof CONTENT_MAX_LENGTH
    | typeof POST_TAGS_INVALID
    | typeof POST_TAGS_LIMIT_EXCEEDED
    | typeof POST_TAG_MIN_LENGTH
    | typeof POST_TAG_MAX_LENGTH
    | typeof POST_CREATION_FAILED
    | typeof POST_TAG_FORMAT_INVALID

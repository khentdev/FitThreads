import { ErrorDefinitions } from "../../errors/index.js";

export const FEED_ERROR_CODES = {
    // Post Content Validation
    TITLE_MIN_LENGTH: "TITLE_MIN_LENGTH",
    TITLE_MAX_LENGTH: "TITLE_MAX_LENGTH",
    CONTENT_MIN_LENGTH: "CONTENT_MIN_LENGTH",
    CONTENT_MAX_LENGTH: "CONTENT_MAX_LENGTH",

    // Post Tags Validation
    POST_TAGS_INVALID: "POST_TAGS_INVALID",
    POST_TAGS_LIMIT_EXCEEDED: "POST_TAGS_LIMIT_EXCEEDED",
    POST_TAG_MIN_LENGTH: "POST_TAG_MIN_LENGTH",
    POST_TAG_MAX_LENGTH: "POST_TAG_MAX_LENGTH",
    POST_TAG_FORMAT_INVALID: "POST_TAG_FORMAT_INVALID",

    // Service Layer Error
    POST_CREATION_FAILED: "POST_CREATION_FAILED",

    FEED_RETRIEVAL_FAILED: "FEED_RETRIEVAL_FAILED",
    USER_NOT_FOUND: "USER_NOT_FOUND",
    FAVORITED_POSTS_RETRIEVAL_FAILED: "FAVORITED_POSTS_RETRIEVAL_FAILED",
    POST_NOT_FOUND: "POST_NOT_FOUND",
    TOGGLE_LIKE_FAILED: "TOGGLE_LIKE_FAILED"
} as const

export const FEED_ERROR_DEF: Record<FeedErrorCode, ErrorDefinitions> = {
    // Post Content Validation
    TITLE_MIN_LENGTH: {
        code: "TITLE_MIN_LENGTH",
        status: 400,
        message: "Post title must be at least 6 characters. Make it clear and compelling."
    },
    TITLE_MAX_LENGTH: {
        code: "TITLE_MAX_LENGTH",
        status: 400,
        message: "Post title must be 100 characters or fewer. Keep it concise."
    },
    CONTENT_MIN_LENGTH: {
        code: "CONTENT_MIN_LENGTH",
        status: 400,
        message: "Post content must be at least 20 characters. Share a real fitness thought."
    },
    CONTENT_MAX_LENGTH: {
        code: "CONTENT_MAX_LENGTH",
        status: 400,
        message: "Post content must be 500 characters or fewer. Keep your thought focused."
    },

    // Post Tags Validation
    POST_TAGS_INVALID: {
        code: "POST_TAGS_INVALID",
        status: 400,
        message: "Please add at least one tag to help others discover your post."
    },
    POST_TAGS_LIMIT_EXCEEDED: {
        code: "POST_TAGS_LIMIT_EXCEEDED",
        status: 400,
        message: "You can add up to 5 tags per post. Choose the most relevant ones."
    },
    POST_TAG_MIN_LENGTH: {
        code: "POST_TAG_MIN_LENGTH",
        status: 400,
        message: "Each tag must be at least 2 characters long."
    },
    POST_TAG_MAX_LENGTH: {
        code: "POST_TAG_MAX_LENGTH",
        status: 400,
        message: "Each tag must be 30 characters or fewer."
    },
    POST_TAG_FORMAT_INVALID: {
        code: "POST_TAG_FORMAT_INVALID",
        status: 400,
        message: "Tags must contain only letters and numbers."
    },

    // Service Layer Error
    POST_CREATION_FAILED: {
        code: "POST_CREATION_FAILED",
        status: 500,
        message: "Failed to post your thought. Please try again."
    },
    FEED_RETRIEVAL_FAILED: {
        code: "FEED_RETRIEVAL_FAILED",
        status: 500,
        message: "Failed to retrieve posts. Please try again."
    },
    USER_NOT_FOUND: {
        code: "USER_NOT_FOUND",
        status: 404,
        message: "User not found."
    },
    FAVORITED_POSTS_RETRIEVAL_FAILED: {
        code: "FAVORITED_POSTS_RETRIEVAL_FAILED",
        status: 500,
        message: "Failed to retrieve favorited posts. Please try again."
    },
    POST_NOT_FOUND: {
        code: "POST_NOT_FOUND",
        status: 404,
        message: "Post not found."
    },
    TOGGLE_LIKE_FAILED: {
        code: "TOGGLE_LIKE_FAILED",
        status: 500,
        message: "Failed to toggle like. Please try again."
    }
}
export type FeedErrorCode = keyof typeof FEED_ERROR_CODES

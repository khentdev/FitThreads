import { FeedCursor } from "./utils/cursor.js"

export type CreatePostParams = {
    authorId: string,
    title: string,
    content: string
    postTags: string[]
}

export type CreatePostRequestBody = {
    title: unknown,
    content: unknown,
    postTags: unknown[]
}

export type CreatePostParamsVariables = {
    createPostParams: {
        authorId: string,
        title: string,
        content: string,
        postTags: string[]
    }
}

export type GetFeedParams = {
    cursor?: {
        id: string
    }
    limit?: number
    sortBy?: "recent" | "top"
    search?: string
    username?: string
    excludeUserId?: string
}

export type GetFeedResponseDTO = {
    data: {
        title: string;
        content: string;
        postTags: {
            tag: {
                name: string;
            };
        }[];
        id: string;
        createdAt: Date;
        author: {
            id: string;
            username: string;
            bio: string | null;
        };
        _count: {
            favorites: number;
            likes: number;
        };
    }[];
    nextCursor: string | null;
    hasMore: boolean;
}
export type GetFavoritedPostsParams = {
    username: string,
    cursor?: string,
    limit?: number
}
export type GetUserFavoritesParams = {
    username: string,
    cursor?: { id: string },
    limit?: number
}
export type getUserFavoritesResponseDTO = {
    data: {
        post: {
            id: string;
            title: string;
            content: string;
            createdAt: Date;
            author: {
                id: string;
                username: string;
                bio: string | null;
            };
            postTags: {
                tag: {
                    name: string;
                };
            }[];
            _count: {
                favorites: number;
                likes: number;
            };
        };
        createdAt: Date;
    }[];
    nextCursor: string | null;
    hasMore: boolean;
} | null

export type ToggleLikeParams = {
    postId: string,
    userId: string
}
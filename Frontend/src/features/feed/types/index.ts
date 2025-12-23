export type CreatePostParams = {
    title: string;
    content: string;
    postTags: string[];
}
export type CreatePostResponse = {
    message: string
}

export type FeedFilters = {
    username?: string
    search?: string
    sortBy?: "recent" | "top"
}
export type GetFeedWithCursorQuery = {
    cursor?: string
    limit?: number
    username?: string
    search?: string
    sortBy?: "recent" | "top"
}
export type GetFeedWithCursorResponse = {
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
        hasLikedByUser: boolean,
        hasFavoritedByUser: boolean
    }[];
    nextCursor: string | null;
    hasMore: boolean;
}

export type GetFavoritePostsQuery = {
    username: string
    cursor?: string
    limit?: number
}
export type GetFavoritePostsResponse = {
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
} | null;

export type ToggleLikeParams = {
    postId: string
}
export type ToggleLikeResponse = {
    hasLiked: boolean
    likeCount: number
}

export type ToggleFavoriteParams = {
    postId: string
}
export type ToggleFavoriteResponse = {
    hasFavorited: boolean
    favoriteCount: number
}
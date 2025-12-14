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
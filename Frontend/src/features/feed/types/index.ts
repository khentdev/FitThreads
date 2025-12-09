export type CreatePostParams = {
    title: string;
    content: string;
    postTags: string[];
}
export type CreatePostResponse = {
    message: string
}

export type GetFeedWithCursorQuery = {
    cursor?: string
    limit?:number
}
export type GetFeedWithCursorResponse = {
    data: {
        title: string;
        content: string;
        postTags: {
            tags: {
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
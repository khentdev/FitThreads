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
        createdAt: string,
        id: string
    }
    limit?: number
}
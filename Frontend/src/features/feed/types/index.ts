export type Post = {
    id: string
    content: string
    authorId: string
    authorUsername: string
    createdAt: string
    likesCount: number
    isLiked: boolean
    isFavorited: boolean
}

export type Tag = {
    id: string
    name: string
}

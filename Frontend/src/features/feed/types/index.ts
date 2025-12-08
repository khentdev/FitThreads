export type CreatePostParams = {
    title: string;
    content: string;
    postTags: string[];
}
export type CreatePostResponse = {
    message: string
}
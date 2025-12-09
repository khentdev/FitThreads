import { axiosInstance } from "../../core/api/axiosConfig";
import type { CreatePostParams, CreatePostResponse, GetFeedWithCursorQuery, GetFeedWithCursorResponse } from "./types";
import { getTypedResponse } from "../../shared/types/types";
export const feedService = {
    createPost: async ({ title, content, postTags }: CreatePostParams) => {
        const res = await axiosInstance.post("/feed/create-post", { title, content, postTags })
        return getTypedResponse<CreatePostResponse>(res)
    },
    getFeedWithCursor: async ({ cursor, limit }: GetFeedWithCursorQuery) => {
        const res = await axiosInstance.get("/feed", { params: { cursor, limit } })
        return getTypedResponse<GetFeedWithCursorResponse>(res)
    }
}
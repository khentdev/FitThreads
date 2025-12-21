import { axiosInstance } from "../../core/api/axiosConfig";
import type { CreatePostParams, CreatePostResponse, GetFeedWithCursorQuery, GetFeedWithCursorResponse, GetFavoritePostsQuery, GetFavoritePostsResponse } from "./types";
import { getTypedResponse } from "../../shared/types/types";
export const feedService = {
    createPost: async ({ title, content, postTags }: CreatePostParams) => {
        const res = await axiosInstance.post("/feed/create-post", { title, content, postTags })
        return getTypedResponse<CreatePostResponse>(res)
    },
    getFeedWithCursor: async ({ cursor, limit, username, search, sortBy }: GetFeedWithCursorQuery) => {
        const res = await axiosInstance.get("/feed", { params: { cursor, limit, username, search, sortBy } })
        return getTypedResponse<GetFeedWithCursorResponse>(res)
    },
    getFavoritePosts: async ({ username, cursor, limit }: GetFavoritePostsQuery) => {
        const res = await axiosInstance.get("/feed/favorites", { params: { username, cursor, limit } })
        return getTypedResponse<GetFavoritePostsResponse>(res)
    }
}

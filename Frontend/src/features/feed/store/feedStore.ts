import { useMutation, useQueryClient, type InfiniteData } from '@tanstack/vue-query'
import type { AxiosError } from 'axios'
import { defineStore } from 'pinia'
import { reactive } from 'vue'
import type { ErrorResponse } from '../../../core/errors'
import { errorHandler, } from '../../../core/errors/errorHandler'
import { useToast } from '../../../shared/composables/toast/useToast'
import * as FEED_ERROR_CODES from '../errors/FeedErrorCodes'
import { feedService } from '../service'
import type { CreatePostParams, GetFavoritePostsResponse, GetFeedWithCursorResponse, ToggleFavoriteParams, ToggleLikeParams } from '../types'
import { useAuthStore } from '../../auth/store/authStore'

type ToggleLikeMutationContext = {
    feedCache: { queryKey: unknown[], previousData: InfiniteData<GetFeedWithCursorResponse> | undefined }[],
    favoritesCache: { queryKey: unknown[], previousData: InfiniteData<GetFavoritePostsResponse> | undefined }[]
}
type ToggleFavoriteMutationContext = {
    feedCache: { queryKey: unknown[], previousData: InfiniteData<GetFeedWithCursorResponse> | undefined }[],
    favoritesCache: { queryKey: unknown[], previousData: InfiniteData<GetFavoritePostsResponse> | undefined }[]
}
type ToggleLikeForFavoritesMutationContext = {
    feedCache: { queryKey: unknown[], previousData: InfiniteData<GetFeedWithCursorResponse> | undefined }[],
    favoritesCache: { queryKey: unknown[], previousData: InfiniteData<GetFavoritePostsResponse> | undefined }[]
}
type ToggleFavoriteForFavoritesMutationContext = {
    feedCache: { queryKey: unknown[], previousData: InfiniteData<GetFeedWithCursorResponse> | undefined }[],
    favoritesCache: { queryKey: unknown[], previousData: InfiniteData<GetFavoritePostsResponse> | undefined }[]
}
export const useFeedStore = defineStore('feed', () => {
    const { toast } = useToast()
    const authStore = useAuthStore()


    const queryClient = useQueryClient()
    const states = reactive({
        creatingPost: false,
        togglingLike: false
    })

    const createPost = async ({ title, content, postTags }: CreatePostParams) => {
        if (states.creatingPost) return { success: false }
        try {
            states.creatingPost = true
            const res = await feedService.createPost({ title, content, postTags })
            toast.success(res.message)
            await queryClient.invalidateQueries({ queryKey: ["feed"] })

            return { success: true }
        } catch (err) {
            const error = err as AxiosError<ErrorResponse<FEED_ERROR_CODES.FeedErrorCode>>
            const { type, code, message } = errorHandler(error)
            const codes = [FEED_ERROR_CODES.TITLE_MIN_LENGTH,
            FEED_ERROR_CODES.CONTENT_MIN_LENGTH,
            FEED_ERROR_CODES.POST_TAG_MIN_LENGTH,
            FEED_ERROR_CODES.POST_TAG_FORMAT_INVALID,
            FEED_ERROR_CODES.POST_TAGS_LIMIT_EXCEEDED,
            FEED_ERROR_CODES.POST_TAGS_INVALID, FEED_ERROR_CODES.POST_CREATION_FAILED]
            if (code && codes.includes(code)) toast.error(message)

            const types: typeof type[] = ["unreachable", "timeout", "offline", "server_error"]
            if (types.includes(type)) toast.error(message)
            return { success: false }
        } finally {
            states.creatingPost = false
        }
    }


    /** Optimistic Update for Like Logic I implemented
     Initial server state: likeCount = 2
     User A's timeline:
     - Sees likeCount: 2
     - Clicks like
     - Optimistic update: 2 + 1 = 3 ✓
     - Server processes: likeCount becomes 3
     - onSuccess syncs: receives likeCount = 4 (User B also liked)
     - Final UI: 4 ✓ (correct)
     User B's timeline:
     - Sees likeCount: 2
     - Clicks like (at nearly same time)
     - Optimistic update: 2 + 1 = 3 ✓
     - Server processes: likeCount becomes 4 (User A already liked)
     - onSuccess syncs: receives likeCount = 4
     - Final UI: 4 ✓ (correct)
      * 
      */


    /**
     * Optimistic Update for Like
     * Update Like button to be active on like toggle while waiting for server response
     * onError: Revert Like button to be inactive -> use the last cached data
     * onSuccess: Active button is active - sync to server response
     * onMutate:
     * Cancel queries 
     * Get previous queries and store in array for rollback later
     * do optimistic update on UI
     * This optimistically updates both Feed View and Profile Favorites View
     */
    const toggleLikeMutation = useMutation({
        mutationFn: ({ postId }: ToggleLikeParams) => feedService.toggleLike({ postId }),
        retry(failureCount, error: AxiosError<ErrorResponse<FEED_ERROR_CODES.FeedErrorCode>>) {
            const { type } = errorHandler(error)
            if (type === "unreachable") return failureCount < 2
            return false
        },
        onMutate: async (variables) => {
            const { postId } = variables

            await queryClient.cancelQueries({ queryKey: ["feed"] })
            await queryClient.cancelQueries({ queryKey: ["profile-favorites"] })

            const previousCachedFeedPosts = queryClient.getQueriesData<InfiniteData<GetFeedWithCursorResponse>>({ queryKey: ["feed"] })
            let feedCache: ToggleLikeMutationContext['feedCache'] = []

            previousCachedFeedPosts.forEach(([queryKey, cachedData]) => {
                if (!cachedData?.pages) return
                const postExists = cachedData.pages.some(page => page.data.some(post => post.id === postId))
                if (!postExists) return

                feedCache.push({ queryKey: queryKey as unknown[], previousData: cachedData })

                const updatedData = {
                    ...cachedData,
                    pages: cachedData.pages.map(page => ({
                        ...page,
                        data: page.data.map(post => {
                            if (post.id !== postId) return post
                            const delta = post.hasLikedByUser ? -1 : 1
                            return {
                                ...post,
                                hasLikedByUser: !post.hasLikedByUser,
                                _count: {
                                    ...post._count,
                                    likes: post._count.likes + delta
                                }
                            }
                        })
                    }))
                }
                queryClient.setQueryData(queryKey, updatedData)
            })

            const previousCachedFavorites = queryClient.getQueriesData<InfiniteData<GetFavoritePostsResponse>>({ queryKey: ["profile-favorites"] })
            let favoritesCache: ToggleLikeMutationContext['favoritesCache'] = []

            previousCachedFavorites.forEach(([queryKey, cachedData]) => {
                if (!cachedData?.pages) return
                const postExists = cachedData.pages.some(page => page?.data?.some(fav => fav.post.id === postId))
                if (!postExists) return

                favoritesCache.push({ queryKey: queryKey as unknown[], previousData: cachedData })

                const updatedData = {
                    ...cachedData,
                    pages: cachedData.pages.map(page => {
                        if (!page?.data) return page
                        return {
                            ...page,
                            data: page.data.map(favorite => {
                                if (favorite.post.id !== postId) return favorite
                                const delta = favorite.post.hasLikedByUser ? -1 : 1
                                return {
                                    ...favorite,
                                    post: {
                                        ...favorite.post,
                                        hasLikedByUser: !favorite.post.hasLikedByUser,
                                        _count: {
                                            ...favorite.post._count,
                                            likes: favorite.post._count.likes + delta
                                        }
                                    }
                                }
                            })
                        }
                    })
                }
                queryClient.setQueryData(queryKey, updatedData)
            })

            return { feedCache, favoritesCache }
        },
        onSuccess: async (data, variables) => {
            const { postId } = variables
            const { hasLiked, likeCount } = data

            const cachedFeedData = queryClient.getQueriesData<InfiniteData<GetFeedWithCursorResponse>>({ queryKey: ["feed"] })
            cachedFeedData.forEach(([queryKey, cached]) => {
                const isPostInCache = cached?.pages.some(page => page.data.some(post => post.id === postId))
                if (cached && isPostInCache) {
                    const updatedData = {
                        ...cached,
                        pages: cached.pages.map(page => ({
                            ...page,
                            data: page.data.map(post =>
                                post.id === postId
                                    ? {
                                        ...post,
                                        hasLikedByUser: hasLiked,
                                        _count: {
                                            ...post._count,
                                            likes: likeCount
                                        }
                                    }
                                    : post
                            )
                        }))
                    }
                    queryClient.setQueryData(queryKey, updatedData)
                }
            })

            const cachedFavoritesData = queryClient.getQueriesData<InfiniteData<GetFavoritePostsResponse>>({ queryKey: ["profile-favorites"] })
            cachedFavoritesData.forEach(([queryKey, cached]) => {
                const isPostInCache = cached?.pages.some(page => page?.data?.some(fav => fav.post.id === postId))
                if (cached && isPostInCache) {
                    const updatedData = {
                        ...cached,
                        pages: cached.pages.map(page => {
                            if (!page?.data) return page
                            return {
                                ...page,
                                data: page.data.map(favorite =>
                                    favorite.post.id === postId
                                        ? {
                                            ...favorite,
                                            post: {
                                                ...favorite.post,
                                                hasLikedByUser: hasLiked,
                                                _count: {
                                                    ...favorite.post._count,
                                                    likes: likeCount
                                                }
                                            }
                                        }
                                        : favorite
                                )
                            }
                        })
                    }
                    queryClient.setQueryData(queryKey, updatedData)
                }
            })
        },
        onError(error: AxiosError<ErrorResponse<FEED_ERROR_CODES.FeedErrorCode>>, _, context) {
            const { type, message } = errorHandler(error)

            context?.feedCache.forEach(({ queryKey, previousData }) => {
                queryClient.setQueryData(queryKey, previousData)
            })
            context?.favoritesCache.forEach(({ queryKey, previousData }) => {
                queryClient.setQueryData(queryKey, previousData)
            })

            const types: typeof type[] = ["offline", "server_error", "timeout", "unreachable"]
            if (types.includes(type)) toast.error(message, { dedup: true })
        },
    })
    /**
    * Optimistic Update for Favorite
    * Update Favorite button to be active on Favorite toggle while waiting for server response
    * onError: Revert Favorite button to be inactive -> use the last cached data
    * onSuccess: Active button is active - sync to server response
    * onMutate:
    * Cancel queries 
    * Get previous queries and store in array for rollback later
    * do optimistic update on UI.
     * This optimistically updates both Feed View and Profile Favorites View
    */
    const toggleFavoriteMutation = useMutation({
        mutationFn: ({ postId }: ToggleFavoriteParams) => feedService.toggleFavorite({ postId }),
        retry(failureCount, error: AxiosError<ErrorResponse<FEED_ERROR_CODES.FeedErrorCode>>) {
            const { type } = errorHandler(error)
            if (type === "unreachable") return failureCount < 2
            return false
        },
        onMutate: async (variables) => {
            const { postId } = variables

            await queryClient.cancelQueries({ queryKey: ["feed"] })
            await queryClient.cancelQueries({ queryKey: ["profile-favorites"] })

            const previousCachedFeedPosts = queryClient.getQueriesData<InfiniteData<GetFeedWithCursorResponse>>({ queryKey: ["feed"] })
            let feedCache: ToggleFavoriteMutationContext['feedCache'] = []

            previousCachedFeedPosts.forEach(([queryKey, cachedData]) => {
                if (!cachedData?.pages) return
                const postExists = cachedData.pages.some(page => page.data.some(post => post.id === postId))
                if (!postExists) return

                feedCache.push({ queryKey: queryKey as unknown[], previousData: cachedData })

                const updatedData = {
                    ...cachedData,
                    pages: cachedData.pages.map(page => ({
                        ...page,
                        data: page.data.map(post => {
                            if (post.id !== postId) return post
                            const delta = post.hasFavoritedByUser ? -1 : 1
                            return {
                                ...post,
                                hasFavoritedByUser: !post.hasFavoritedByUser,
                                _count: {
                                    ...post._count,
                                    favorites: post._count.favorites + delta
                                }
                            }
                        })
                    }))
                }
                queryClient.setQueryData(queryKey, updatedData)
            })

            const previousCachedFavorites = queryClient.getQueriesData<InfiniteData<GetFavoritePostsResponse>>({ queryKey: ["profile-favorites"] })
            let favoritesCache: ToggleFavoriteMutationContext['favoritesCache'] = []

            previousCachedFavorites.forEach(([queryKey, cachedData]) => {
                if (!cachedData?.pages) return
                const postExists = cachedData.pages.some(page => page?.data?.some(fav => fav.post.id === postId))
                if (!postExists) return

                favoritesCache.push({ queryKey: queryKey as unknown[], previousData: cachedData })

                const updatedData = {
                    ...cachedData,
                    pages: cachedData.pages.map(page => {
                        if (!page?.data) return page
                        return {
                            ...page,
                            data: page.data.map(favorite => {
                                if (favorite.post.id !== postId) return favorite
                                const delta = favorite.post.hasFavoritedByUser ? -1 : 1
                                return {
                                    ...favorite,
                                    post: {
                                        ...favorite.post,
                                        hasFavoritedByUser: !favorite.post.hasFavoritedByUser,
                                        _count: {
                                            ...favorite.post._count,
                                            favorites: favorite.post._count.favorites + delta
                                        }
                                    }
                                }
                            })
                        }
                    })
                }
                queryClient.setQueryData(queryKey, updatedData)
            })

            return { feedCache, favoritesCache }
        },
        onSuccess: async (data, variables) => {
            const { postId } = variables
            const { hasFavorited, favoriteCount } = data

            const cachedFeedData = queryClient.getQueriesData<InfiniteData<GetFeedWithCursorResponse>>({ queryKey: ["feed"] })
            cachedFeedData.forEach(([queryKey, cached]) => {
                const isPostInCache = cached?.pages.some(page => page.data.some(post => post.id === postId))
                if (cached && isPostInCache) {
                    const updatedData = {
                        ...cached,
                        pages: cached.pages.map(page => ({
                            ...page,
                            data: page.data.map(post =>
                                post.id === postId
                                    ? {
                                        ...post,
                                        hasFavoritedByUser: hasFavorited,
                                        _count: {
                                            ...post._count,
                                            favorites: favoriteCount
                                        }
                                    }
                                    : post
                            )
                        }))
                    }
                    queryClient.setQueryData(queryKey, updatedData)
                }
            })

            const cachedFavoritesData = queryClient.getQueriesData<InfiniteData<GetFavoritePostsResponse>>({ queryKey: ["profile-favorites"] })
            cachedFavoritesData.forEach(([queryKey, cached]) => {
                const isPostInCache = cached?.pages.some(page => page?.data?.some(fav => fav.post.id === postId))
                if (cached && isPostInCache) {
                    const updatedData = {
                        ...cached,
                        pages: cached.pages.map(page => {
                            if (!page?.data) return page
                            return {
                                ...page,
                                data: page.data.map(favorite =>
                                    favorite.post.id === postId
                                        ? {
                                            ...favorite,
                                            post: {
                                                ...favorite.post,
                                                hasFavoritedByUser: hasFavorited,
                                                _count: {
                                                    ...favorite.post._count,
                                                    favorites: favoriteCount
                                                }
                                            }
                                        }
                                        : favorite
                                )
                            }
                        })
                    }
                    queryClient.setQueryData(queryKey, updatedData)
                }
            })

            await queryClient.invalidateQueries({ queryKey: ["profile-favorites"] })
        },
        onError(error: AxiosError<ErrorResponse<FEED_ERROR_CODES.FeedErrorCode>>, _, context) {
            const { type, message } = errorHandler(error)

            context?.feedCache.forEach(({ queryKey, previousData }) => {
                queryClient.setQueryData(queryKey, previousData)
            })

            context?.favoritesCache.forEach(({ queryKey, previousData }) => {
                queryClient.setQueryData(queryKey, previousData)
            })

            const types: typeof type[] = ["offline", "server_error", "timeout", "unreachable"]
            if (types.includes(type)) toast.error(message, { dedup: true })
        },
    })

    /**
     * Optimistic Update for Like in Favorites View
     * Handles GetFavoritePostsResponse structure where posts are nested inside favorite objects
     * onError: Revert to previous cached data
     * onSuccess: Sync to server response
     * onMutate: Cancel queries, store previous data, do optimistic update on UI.
     * This optimistically updates both Profile Favorites View and Feed View
     */
    const toggleLikeForFavoritesMutation = useMutation({
        mutationFn: ({ postId }: ToggleLikeParams) => feedService.toggleLike({ postId }),
        retry(failureCount, error: AxiosError<ErrorResponse<FEED_ERROR_CODES.FeedErrorCode>>) {
            const { type } = errorHandler(error)
            if (type === "unreachable") return failureCount < 2
            return false
        },
        onMutate: async (variables) => {
            const { postId } = variables

            await queryClient.cancelQueries({ queryKey: ["profile-favorites"] })
            await queryClient.cancelQueries({ queryKey: ["feed"] })

            const previousCachedFavorites = queryClient.getQueriesData<InfiniteData<GetFavoritePostsResponse>>({ queryKey: ["profile-favorites"] })
            let favoritesCache: ToggleLikeForFavoritesMutationContext['favoritesCache'] = []

            previousCachedFavorites.forEach(([queryKey, cachedData]) => {
                if (!cachedData?.pages) return
                const postExists = cachedData.pages.some(page => page?.data?.some(fav => fav.post.id === postId))
                if (!postExists) return

                favoritesCache.push({ queryKey: queryKey as unknown[], previousData: cachedData })

                const updatedData = {
                    ...cachedData,
                    pages: cachedData.pages.map(page => {
                        if (!page?.data) return page
                        return {
                            ...page,
                            data: page.data.map(favorite => {
                                if (favorite.post.id !== postId) return favorite
                                const delta = favorite.post.hasLikedByUser ? -1 : 1
                                return {
                                    ...favorite,
                                    post: {
                                        ...favorite.post,
                                        hasLikedByUser: !favorite.post.hasLikedByUser,
                                        _count: {
                                            ...favorite.post._count,
                                            likes: favorite.post._count.likes + delta
                                        }
                                    }
                                }
                            })
                        }
                    })
                }
                queryClient.setQueryData(queryKey, updatedData)
            })

            const previousCachedFeedPosts = queryClient.getQueriesData<InfiniteData<GetFeedWithCursorResponse>>({ queryKey: ["feed"] })
            let feedCache: ToggleLikeForFavoritesMutationContext['feedCache'] = []

            previousCachedFeedPosts.forEach(([queryKey, cachedData]) => {
                if (!cachedData?.pages) return
                const postExists = cachedData.pages.some(page => page.data.some(post => post.id === postId))
                if (!postExists) return

                feedCache.push({ queryKey: queryKey as unknown[], previousData: cachedData })

                const updatedData = {
                    ...cachedData,
                    pages: cachedData.pages.map(page => ({
                        ...page,
                        data: page.data.map(post => {
                            if (post.id !== postId) return post
                            const delta = post.hasLikedByUser ? -1 : 1
                            return {
                                ...post,
                                hasLikedByUser: !post.hasLikedByUser,
                                _count: {
                                    ...post._count,
                                    likes: post._count.likes + delta
                                }
                            }
                        })
                    }))
                }
                queryClient.setQueryData(queryKey, updatedData)
            })

            return { feedCache, favoritesCache }
        },
        onSuccess: async (data, variables) => {
            const { postId } = variables
            const { hasLiked, likeCount } = data

            const cachedFavoritesData = queryClient.getQueriesData<InfiniteData<GetFavoritePostsResponse>>({ queryKey: ["profile-favorites"] })
            cachedFavoritesData.forEach(([queryKey, cached]) => {
                const isPostInCache = cached?.pages.some(page => page?.data?.some(fav => fav.post.id === postId))
                if (cached && isPostInCache) {
                    const updatedData = {
                        ...cached,
                        pages: cached.pages.map(page => {
                            if (!page?.data) return page
                            return {
                                ...page,
                                data: page.data.map(favorite =>
                                    favorite.post.id === postId
                                        ? {
                                            ...favorite,
                                            post: {
                                                ...favorite.post,
                                                hasLikedByUser: hasLiked,
                                                _count: {
                                                    ...favorite.post._count,
                                                    likes: likeCount
                                                }
                                            }
                                        }
                                        : favorite
                                )
                            }
                        })
                    }
                    queryClient.setQueryData(queryKey, updatedData)
                }
            })

            const cachedFeedData = queryClient.getQueriesData<InfiniteData<GetFeedWithCursorResponse>>({ queryKey: ["feed"] })
            cachedFeedData.forEach(([queryKey, cached]) => {
                const isPostInCache = cached?.pages.some(page => page.data.some(post => post.id === postId))
                if (cached && isPostInCache) {
                    const updatedData = {
                        ...cached,
                        pages: cached.pages.map(page => ({
                            ...page,
                            data: page.data.map(post =>
                                post.id === postId
                                    ? {
                                        ...post,
                                        hasLikedByUser: hasLiked,
                                        _count: {
                                            ...post._count,
                                            likes: likeCount
                                        }
                                    }
                                    : post
                            )
                        }))
                    }
                    queryClient.setQueryData(queryKey, updatedData)
                }
            })
        },
        onError(error: AxiosError<ErrorResponse<FEED_ERROR_CODES.FeedErrorCode>>, _, context) {
            const { type, message } = errorHandler(error)

            context?.favoritesCache.forEach(({ queryKey, previousData }) => {
                queryClient.setQueryData(queryKey, previousData)
            })

            context?.feedCache.forEach(({ queryKey, previousData }) => {
                queryClient.setQueryData(queryKey, previousData)
            })

            const types: typeof type[] = ["offline", "server_error", "timeout", "unreachable"]
            if (types.includes(type)) toast.error(message, { dedup: true })
        },
    })

    /**
     * Optimistic Update for Favorite in Favorites View
     * Handles GetFavoritePostsResponse structure where posts are nested inside favorite objects
     * Special behavior: Removes items from list when unfavoriting (they shouldn't appear in favorites anymore)
     * onError: Revert to previous cached data
     * onSuccess: Sync to server response
     * onMutate: Cancel queries, store previous data, do optimistic update on UI
     * This optimistically updates both Profile Favorites View and Feed View
     */
    const toggleFavoriteForFavoritesMutation = useMutation({
        mutationFn: ({ postId }: ToggleFavoriteParams) => feedService.toggleFavorite({ postId }),
        retry(failureCount, error: AxiosError<ErrorResponse<FEED_ERROR_CODES.FeedErrorCode>>) {
            const { type } = errorHandler(error)
            if (type === "unreachable") return failureCount < 2
            return false
        },
        onMutate: async (variables) => {
            const { postId } = variables

            await queryClient.cancelQueries({ queryKey: ["profile-favorites"] })
            await queryClient.cancelQueries({ queryKey: ["feed"] })

            const previousCachedFavorites = queryClient.getQueriesData<InfiniteData<GetFavoritePostsResponse>>({ queryKey: ["profile-favorites"] })
            let favoritesCache: ToggleFavoriteForFavoritesMutationContext['favoritesCache'] = []

            previousCachedFavorites.forEach(([queryKey, cachedData]) => {
                if (!cachedData?.pages) return
                const postExists = cachedData.pages.some(page => page?.data?.some(fav => fav.post.id === postId))
                if (!postExists) return

                favoritesCache.push({ queryKey: queryKey as unknown[], previousData: cachedData })

                const queryUsername = (queryKey[1] as { username: string })?.username
                const isAuthUser = queryUsername === authStore.getUsername

                const updatedData = {
                    ...cachedData,
                    pages: cachedData.pages.map(page => {
                        if (!page?.data) return page

                        if (isAuthUser) {
                            return {
                                ...page,
                                data: page.data.filter(favorite => favorite.post.id !== postId)
                            }
                        }

                        return {
                            ...page,
                            data: page.data.map(favorite => {
                                if (favorite.post.id !== postId) return favorite
                                const delta = favorite.post.hasFavoritedByUser ? -1 : 1
                                return {
                                    ...favorite,
                                    post: {
                                        ...favorite.post,
                                        hasFavoritedByUser: !favorite.post.hasFavoritedByUser,
                                        _count: {
                                            ...favorite.post._count,
                                            favorites: favorite.post._count.favorites + delta
                                        }
                                    }
                                }
                            })
                        }
                    })
                }
                queryClient.setQueryData(queryKey, updatedData)
            })

            const previousCachedFeedPosts = queryClient.getQueriesData<InfiniteData<GetFeedWithCursorResponse>>({ queryKey: ["feed"] })
            let feedCache: ToggleFavoriteForFavoritesMutationContext['feedCache'] = []

            previousCachedFeedPosts.forEach(([queryKey, cachedData]) => {
                if (!cachedData?.pages) return
                const postExists = cachedData.pages.some(page => page.data.some(post => post.id === postId))
                if (!postExists) return

                feedCache.push({ queryKey: queryKey as unknown[], previousData: cachedData })

                const updatedData = {
                    ...cachedData,
                    pages: cachedData.pages.map(page => ({
                        ...page,
                        data: page.data.map(post => {
                            if (post.id !== postId) return post
                            const delta = post.hasFavoritedByUser ? -1 : 1
                            return {
                                ...post,
                                hasFavoritedByUser: !post.hasFavoritedByUser,
                                _count: {
                                    ...post._count,
                                    favorites: post._count.favorites + delta
                                }
                            }
                        })
                    }))
                }
                queryClient.setQueryData(queryKey, updatedData)
            })

            return { feedCache, favoritesCache }
        },
        onSuccess: async (data, variables) => {
            const { postId } = variables
            const { hasFavorited, favoriteCount } = data

            const cachedFavoritesData = queryClient.getQueriesData<InfiniteData<GetFavoritePostsResponse>>({ queryKey: ["profile-favorites"] })
            cachedFavoritesData.forEach(([queryKey, cached]) => {
                const queryUsername = (queryKey[1] as { username: string })?.username
                const isAuthUser = queryUsername === authStore.getUsername

                if (cached) {
                    const updatedData = {
                        ...cached,
                        pages: cached.pages.map(page => {
                            if (!page?.data) return page

                            if (isAuthUser && !hasFavorited) {
                                return {
                                    ...page,
                                    data: page.data.filter(favorite => favorite.post.id !== postId)
                                }
                            }

                            return {
                                ...page,
                                data: page.data.map(favorite =>
                                    favorite.post.id === postId
                                        ? {
                                            ...favorite,
                                            post: {
                                                ...favorite.post,
                                                hasFavoritedByUser: hasFavorited,
                                                _count: {
                                                    ...favorite.post._count,
                                                    favorites: favoriteCount
                                                }
                                            }
                                        }
                                        : favorite
                                )
                            }
                        })
                    }
                    queryClient.setQueryData(queryKey, updatedData)
                }
            })

            const cachedFeedData = queryClient.getQueriesData<InfiniteData<GetFeedWithCursorResponse>>({ queryKey: ["feed"] })
            cachedFeedData.forEach(([queryKey, cached]) => {
                const isPostInCache = cached?.pages.some(page => page.data.some(post => post.id === postId))
                if (cached && isPostInCache) {
                    const updatedData = {
                        ...cached,
                        pages: cached.pages.map(page => ({
                            ...page,
                            data: page.data.map(post =>
                                post.id === postId
                                    ? {
                                        ...post,
                                        hasFavoritedByUser: hasFavorited,
                                        _count: {
                                            ...post._count,
                                            favorites: favoriteCount
                                        }
                                    }
                                    : post
                            )
                        }))
                    }
                    queryClient.setQueryData(queryKey, updatedData)
                }
            })
        },
        onError(error: AxiosError<ErrorResponse<FEED_ERROR_CODES.FeedErrorCode>>, _, context) {
            const { type, message } = errorHandler(error)

            context?.favoritesCache.forEach(({ queryKey, previousData }) => {
                queryClient.setQueryData(queryKey, previousData)
            })

            context?.feedCache.forEach(({ queryKey, previousData }) => {
                queryClient.setQueryData(queryKey, previousData)
            })

            const types: typeof type[] = ["offline", "server_error", "timeout", "unreachable"]
            if (types.includes(type)) toast.error(message, { dedup: true })
        },
    })


    const toggleLike = ({ postId }: ToggleLikeParams) => {
        toggleLikeMutation.mutate({ postId })
    }
    const toggleFavorite = ({ postId }: ToggleFavoriteParams) => {
        toggleFavoriteMutation.mutate({ postId })
    }
    const toggleLikeForFavorites = ({ postId }: ToggleLikeParams) => {
        toggleLikeForFavoritesMutation.mutate({ postId })
    }
    const toggleFavoriteForFavorites = ({ postId }: ToggleFavoriteParams) => {
        toggleFavoriteForFavoritesMutation.mutate({ postId })
    }


    return {
        states,
        createPost,
        toggleLike,
        toggleFavorite,
        toggleLikeForFavorites,
        toggleFavoriteForFavorites,
    }
})

import { useMutation, useQueryClient, type InfiniteData } from '@tanstack/vue-query'
import type { AxiosError } from 'axios'
import { defineStore } from 'pinia'
import { reactive, toValue, watchEffect } from 'vue'
import type { ErrorResponse } from '../../../core/errors'
import { errorHandler, } from '../../../core/errors/errorHandler'
import { useToast } from '../../../shared/composables/toast/useToast'
import { useGlobalLoadingState } from '../../../shared/store/useGlobalStates'
import * as FEED_ERROR_CODES from '../errors/FeedErrorCodes'
import { feedService } from '../service'
import type { CreatePostParams, GetFeedWithCursorResponse, ToggleLikeParams } from '../types'

type ToggleLikeMutationContext = {
    queryKey: unknown[],
    previousData: InfiniteData<GetFeedWithCursorResponse> | undefined
}
export const useFeedStore = defineStore('feed', () => {
    const { toast } = useToast()
    const { setLoading } =
        useGlobalLoadingState()

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

    /**
     * Optimistic Update for Like
     * Update Like button to be active on like toggle while waiting for server response
     * onError: Revert Like button to be inactive -> use the last cached data
     * onSuccess: Active button is active - sync to server response and invalidate cache from other queries that renders posts feed
     * onMutate:
     * Cancel queries 
     * Get previous queries and store in array for rollback later
     * do optimistic update on UI
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
            const previousCachedFeedPosts = queryClient.getQueriesData<InfiniteData<GetFeedWithCursorResponse>>({ queryKey: ["feed"] })

            let previousCachedFeedPostsData: ToggleLikeMutationContext[] = []
            previousCachedFeedPosts.forEach(([queryKey, cachedData]) => {
                if (!cachedData?.pages) return
                const postExists = cachedData.pages.some(page => page.data.some(post => post.id === postId))
                if (!postExists) return
                previousCachedFeedPostsData.push({ queryKey: queryKey as unknown[], previousData: cachedData })
                const updatedData: ToggleLikeMutationContext['previousData'] = {
                    ...cachedData,
                    pages: cachedData.pages.map(page => ({
                        ...page,
                        data: page.data.map(post => {
                            if (post.id !== postId) return post;
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
            return { previousCachedFeedPostsData }

        },
        onSuccess: (data, variables) => {
            const { postId } = variables
            const { hasLiked, likeCount } = data
            const cachedData = queryClient.getQueriesData<InfiniteData<GetFeedWithCursorResponse>>({ queryKey: ["feed"] })
            cachedData.forEach(([queryKey, cached]) => {
                const isPostInCache = cached?.pages.some(page => page.data.some(post => post.id === postId))
                if (cached && isPostInCache) {
                    const updatedData: ToggleLikeMutationContext['previousData'] = {
                        ...cached,
                        pages: cached.pages.map(page => ({
                            ...page,
                            data: page.data.map(post => (
                                post.id === postId ?
                                    {
                                        ...post,
                                        hasLikedByUser: hasLiked,
                                        _count: {
                                            ...post._count,
                                            likes: likeCount
                                        }

                                    } : post
                            ))
                        }))
                    }
                    queryClient.setQueryData(queryKey, updatedData)
                }
            })
        },
        onError(error: AxiosError<ErrorResponse<FEED_ERROR_CODES.FeedErrorCode>>, _, context) {
            const { type, message } = errorHandler(error);
            context?.previousCachedFeedPostsData.forEach(({ queryKey, previousData }) => {
                queryClient.setQueryData(queryKey, previousData)
            })
            const types: typeof type[] = ["offline", "server_error", "timeout", "unreachable"]
            if (types.includes(type)) toast.error(message, { dedup: true })
        },
    })

    const toggleLike = ({ postId }: ToggleLikeParams) => {
        toggleLikeMutation.mutate({ postId })
    }

    watchEffect(() => {
        setLoading("feed", "toggleLikeMutation", toValue(toggleLikeMutation.isPending))
    })

    return {
        states,
        createPost,
        toggleLike,
        toggleLikeMutation,
    }
})

import { defineStore } from 'pinia'
import { errorHandler, } from '../../../core/errors/errorHandler'
import type { AxiosError } from 'axios'
import type { ErrorResponse } from '../../../core/errors'
import type { CreatePostParams } from '../types'
import { feedService } from '../service'
import { useToast } from '../../../shared/composables/toast/useToast'
import { reactive } from 'vue'
import * as FEED_ERROR_CODES from '../errors/feedErrorCodes'

export const useFeedStore = defineStore('feed', () => {
    const { toast } = useToast()

    const states = reactive({
        creatingPost: false
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

    return {
        createPost,
        states
    }
})

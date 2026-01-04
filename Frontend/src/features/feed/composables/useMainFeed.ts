import { useInfiniteQuery } from "@tanstack/vue-query"
import { feedService } from "../service"
import type { MaybeRefOrGetter } from "vue"
import { computed, ref, toValue, watch } from "vue"
import { errorHandler } from "../../../core/errors/errorHandler"
import type { AxiosError } from "axios"
import { formatRetryTime } from "../../../shared/utils/formatRetryTime"
import * as FEED_ERROR_CODES from "../errors/FeedErrorCodes"
import type { ErrorResponse } from "../../../core/errors"

export const useMainFeed = (sortBy: MaybeRefOrGetter<'recent' | 'top'> = 'recent') => {
    const query = useInfiniteQuery({
        queryKey: ['feed', { sortBy }],
        queryFn: ({ pageParam }) => feedService.getFeedWithCursor({
            cursor: pageParam,
            limit: 5,
            sortBy: toValue(sortBy)
        }),
        retry: 3,
        initialPageParam: "",
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000
    })

    const retryCountdown = ref(0)
    let countdownInterval: ReturnType<typeof setInterval> | null = null

    const startCountdown = (seconds: number) => {
        if (countdownInterval) clearInterval(countdownInterval)
        retryCountdown.value = seconds

        countdownInterval = setInterval(() => {
            if (retryCountdown.value <= 0) {
                if (countdownInterval) clearInterval(countdownInterval)
                return
            }
            retryCountdown.value--
        }, 1000)
    }

    const errorMessage = computed(() => {
        if (!query.error.value) return ""
        const axiosError = query.error.value as AxiosError<ErrorResponse<FEED_ERROR_CODES.FeedErrorCode>>
        const { code } = errorHandler(axiosError)
        if (code === FEED_ERROR_CODES.GET_FEED_RATELIMIT_EXCEEDED) {
            return `You're loading posts too fast. Please wait ${formatRetryTime(retryCountdown.value)}.`
        }
        return "Something went wrong. Please check your connection and try again."
    })

    watch(query.error, (error) => {
        if (!error) return
        const axiosError = error as AxiosError<ErrorResponse<FEED_ERROR_CODES.FeedErrorCode>>
        const { code, data } = errorHandler(axiosError)

        if (code === FEED_ERROR_CODES.GET_FEED_RATELIMIT_EXCEEDED) {
            const seconds = data?.['retryAfter'] as number
            startCountdown(seconds)
        }
    })

    return { ...query, errorMessage }
}

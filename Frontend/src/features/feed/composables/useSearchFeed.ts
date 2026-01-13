import { useInfiniteQuery } from "@tanstack/vue-query"
import type { AxiosError } from "axios"
import type { MaybeRefOrGetter } from "vue"
import { computed, ref, toValue, watch } from "vue"
import type { ErrorResponse } from "../../../core/errors"
import { errorHandler } from "../../../core/errors/errorHandler"
import { formatRetryTime } from "../../../shared/utils/formatRetryTime"
import * as FEED_ERROR_CODES from "../errors/FeedErrorCodes"
import { feedService } from "../service"


export const useSearchFeed = (
    search: MaybeRefOrGetter<string>,
    sortBy: MaybeRefOrGetter<'recent' | 'top'> = 'top',
    options: { enabled?: MaybeRefOrGetter<boolean> } = {}
) => {

    const query = useInfiniteQuery({
        queryKey: ['feed', { search, sortBy }],
        queryFn: ({ pageParam }) => feedService.getFeedWithCursor({
            cursor: pageParam,
            limit: 5,
            search: toValue(search),
            sortBy: toValue(sortBy)
        }),
        initialPageParam: "",
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        refetchOnWindowFocus: false,
        retry: false,
        enabled: () => {
            const isSearchValid = toValue(search).trim().length > 0
            const isEnabled = options.enabled !== undefined ? toValue(options.enabled) : true
            return isSearchValid && isEnabled
        },
        staleTime: Infinity,
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
        if (code === 'FEED_SEARCH_RATELIMIT_EXCEEDED') {
            return `Search limit reached. Please wait ${formatRetryTime(retryCountdown.value)}.`
        }
        return "Something went wrong. Please check your connection and try again."
    })

    watch(query.error, (error) => {
        if (!error) return
        const axiosError = error as AxiosError<ErrorResponse<FEED_ERROR_CODES.FeedErrorCode>>
        const { code, data } = errorHandler(axiosError)

        if (code === 'FEED_SEARCH_RATELIMIT_EXCEEDED') {
            const seconds = data?.['retryAfter'] as number
            startCountdown(seconds)
        }
    })

    return { ...query, errorMessage }
}

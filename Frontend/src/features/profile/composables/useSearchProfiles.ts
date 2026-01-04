import { useInfiniteQuery } from "@tanstack/vue-query"
import type { AxiosError } from "axios"
import { computed, type MaybeRefOrGetter, ref, toValue, watch } from "vue"
import type { ErrorResponse } from "../../../core/errors"
import { errorHandler } from "../../../core/errors/errorHandler"
import { formatRetryTime } from "../../../shared/utils/formatRetryTime"
import * as PROFILE_ERROR_CODE from "../errors/profileErrorCodes"
import { profileService } from "../service"

export const useSearchProfiles = (searchQuery: MaybeRefOrGetter<string>,
    activeTab: MaybeRefOrGetter<'profile' | "top" | "recent">
) => {
    const query = useInfiniteQuery({
        queryKey: ["profile", "search", searchQuery],
        queryFn: ({ pageParam }) => profileService.searchProfiles({ searchQuery: toValue(searchQuery), limit: 10, cursor: pageParam }),
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        retry: false,
        initialPageParam: "",
        refetchOnWindowFocus: false,
        enabled: () => toValue(searchQuery).trim().length > 0 && toValue(activeTab) === "profile",
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
        const axiosError = query.error.value as AxiosError<ErrorResponse<PROFILE_ERROR_CODE.ProfileErrorCode>>
        const { code } = errorHandler(axiosError)
        if (code === 'PROFILE_SEARCH_RATELIMIT_EXCEEDED') {
            return `Search limit reached. Please wait ${formatRetryTime(retryCountdown.value)}.`
        }
        return "Something went wrong. Please check your connection and try again."
    })

    watch(query.error, (error) => {
        if (!error) return
        const axiosError = error as AxiosError<ErrorResponse<PROFILE_ERROR_CODE.ProfileErrorCode>>
        const { code, data } = errorHandler(axiosError)

        if (code === 'PROFILE_SEARCH_RATELIMIT_EXCEEDED') {
            const seconds = data?.['retryAfter'] as number
            startCountdown(seconds)
        }
    })
    return { ...query, errorMessage }
}
import { useInfiniteQuery } from "@tanstack/vue-query"
import type { MaybeRefOrGetter } from "vue"
import { toValue } from "vue"
import { feedService } from "../service"

export const useUserPosts = (
    username: MaybeRefOrGetter<string>,
    sortBy: MaybeRefOrGetter<'recent' | 'top'> = 'recent'
) => {
    return useInfiniteQuery({
        queryKey: ['feed', { username, sortBy }],
        queryFn: ({ pageParam }) => feedService.getFeedWithCursor({
            cursor: pageParam,
            limit: 5,
            username: toValue(username),
            sortBy: toValue(sortBy)
        }),
        staleTime: 60 * 1000,
        initialPageParam: "",
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        refetchOnWindowFocus: false,
        enabled: !!toValue(username),
    })
}

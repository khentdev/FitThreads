import { useInfiniteQuery } from "@tanstack/vue-query"
import { feedService } from "../service"
import type { MaybeRefOrGetter } from "vue"
import { toValue } from "vue"


export const useMainFeed = (sortBy: MaybeRefOrGetter<'recent' | 'top'> = 'recent') => {
    return useInfiniteQuery({
        queryKey: ['feed', { sortBy: toValue(sortBy) }],
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
}

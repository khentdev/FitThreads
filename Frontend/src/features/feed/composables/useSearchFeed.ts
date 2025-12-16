import { useInfiniteQuery } from "@tanstack/vue-query"
import { feedService } from "../service"
import type { MaybeRefOrGetter } from "vue"
import { toValue } from "vue"


export const useSearchFeed = (
    search: MaybeRefOrGetter<string>,
    sortBy: MaybeRefOrGetter<'recent' | 'top'> = 'top',
    options: { enabled?: MaybeRefOrGetter<boolean> } = {}
) => {
    return useInfiniteQuery({
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
    })
}

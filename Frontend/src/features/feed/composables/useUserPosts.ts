import { useInfiniteQuery } from "@tanstack/vue-query"
import { feedService } from "../service"
import type { MaybeRefOrGetter } from "vue"
import { toValue } from "vue"

/**
 * Composable for fetching a specific user's posts
 * @param username - Username to fetch posts for
 * @param sortBy - Sort order: 'recent' (default) or 'top'
 * @returns Infinite query for user's posts
 */
export const useUserPosts = (
    username: MaybeRefOrGetter<string>,
    sortBy: MaybeRefOrGetter<'recent' | 'top'> = 'recent'
) => {
    return useInfiniteQuery({
        queryKey: ['feed', { username: toValue(username), sortBy: toValue(sortBy) }],
        queryFn: ({ pageParam }) => feedService.getFeedWithCursor({
            cursor: pageParam,
            limit: 5,
            username: toValue(username),
            sortBy: toValue(sortBy)
        }),
        initialPageParam: "",
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        refetchOnWindowFocus: false,
        enabled: !!toValue(username),
    })
}

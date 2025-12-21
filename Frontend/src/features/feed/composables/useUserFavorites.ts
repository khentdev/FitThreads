import { useInfiniteQuery } from "@tanstack/vue-query"
import type { MaybeRefOrGetter } from "vue"
import { toValue } from "vue"
import { feedService } from "../service"

export const useUserFavorites = (username: MaybeRefOrGetter<string>) => {
    return useInfiniteQuery({
        queryKey: ['profile-favorites', { username }],
        queryFn: ({ pageParam }) => feedService.getFavoritePosts({
            cursor: pageParam,
            limit: 5,
            username: toValue(username),
        }),
        staleTime: 60 * 1000,
        initialPageParam: "",
        getNextPageParam: (lastPage) => lastPage && lastPage.nextCursor,
        refetchOnWindowFocus: false,
        enabled: !!toValue(username),
    })
}

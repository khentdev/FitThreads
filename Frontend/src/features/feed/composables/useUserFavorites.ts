import { useInfiniteQuery } from "@tanstack/vue-query"
import { feedService } from "../service"
import type { MaybeRefOrGetter } from "vue"
import { toValue } from "vue"


export const useUserFavorites = (username: MaybeRefOrGetter<string>) => {
    return useInfiniteQuery({
        queryKey: ['profile-favorites', { username: toValue(username), favorite: true }],
        queryFn: ({ pageParam }) => feedService.getFeedWithCursor({
            cursor: pageParam,
            limit: 5,
            username: toValue(username),
            // TODO: Add favorite: true when backend supports it
        }),
        initialPageParam: "",
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        refetchOnWindowFocus: false,
        enabled: !!toValue(username), // Only run if username is provided
    })
}

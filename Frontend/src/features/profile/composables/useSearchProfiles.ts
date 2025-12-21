import { useInfiniteQuery } from "@tanstack/vue-query"
import { type MaybeRefOrGetter, toValue } from "vue"
import { profileService } from "../service"

export const useSearchProfiles = (searchQuery: MaybeRefOrGetter<string>,
    activeTab: MaybeRefOrGetter<'profile' | "top" | "recent">
) => {
    return useInfiniteQuery({
        queryKey: ["profile", "search", searchQuery],
        queryFn: ({ pageParam }) => profileService.searchProfiles({ searchQuery: toValue(searchQuery), limit: 10, cursor: pageParam }),
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        retry: false,
        initialPageParam: "",
        refetchOnWindowFocus: false,
        enabled: () => toValue(searchQuery).trim().length > 0 && toValue(activeTab) === "profile",
    })
}
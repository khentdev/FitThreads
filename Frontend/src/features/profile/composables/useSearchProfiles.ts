import { useQuery } from "@tanstack/vue-query"
import { profileService } from "../service"
import { type MaybeRefOrGetter, toValue } from "vue"

// export const useSearchProfiles = (username: MaybeRefOrGetter<string>,
//     activeTab: MaybeRefOrGetter<'profile' | "top" | "recent">
// ) => {
//     return useQuery({
//         queryKey: ['profiles', 'search', toValue(username)],
//         refetchOnWindowFocus: false,
//         retry: false,
//         queryFn: () => profileService.searchProfiles(toValue(username)),
//         enabled: () => toValue(username).trim().length > 0 && toValue(activeTab) === "profile",
//         staleTime: 1000 * 60 * 5,
//     })
// }
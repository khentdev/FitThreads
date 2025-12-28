import { axiosInstance } from "../../core/api/axiosConfig";
import { getTypedResponse } from "../../shared/types/types";
import type { ProfileSearchQueryParams, ProfileSearchResponse, UpdateProfileResponse, UserProfile } from "./types";


export const profileService = {
    getProfile: async (username: string) => {
        const res = await axiosInstance.get(`/profile/${username}`);
        return getTypedResponse<UserProfile>(res)
    },
    searchProfiles: async ({ limit, cursor, searchQuery }: ProfileSearchQueryParams) => {
        const res = await axiosInstance.get("/profile/search", {
            params: {
                limit,
                cursor,
                searchQuery
            }
        });
        return getTypedResponse<ProfileSearchResponse>(res)
    },
    updateProfile: async ({ bio }: { bio: string }) => {
        const res = await axiosInstance.put("/profile/update", { bio })
        return getTypedResponse<UpdateProfileResponse>(res)
    }


}

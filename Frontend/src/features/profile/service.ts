import { axiosInstance } from "../../core/api/axiosConfig";
import { getTypedResponse } from "../../shared/types/types";
import type { UserProfile } from "./types";


export const profileService = {
    getProfile: async (username: string) => {
        const res = await axiosInstance.get(`/profile/${username}`);
        return getTypedResponse<UserProfile>(res)
    }
}
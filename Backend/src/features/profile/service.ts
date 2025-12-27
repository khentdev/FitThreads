import { AppError } from "../../errors/customError.js";
import logger from "../../lib/logger.js";
import { getUserProfile, searchProfiles, updateProfile } from "./data.js";
import type { getUserProfileResponseDTO, SearchProfilesResponseDTO, UpdateProfileParams } from "./types.js";

export const getUserProfileService = async (username: string): Promise<getUserProfileResponseDTO> => {
    try {
        const profile = await getUserProfile(username);
        if (!profile) throw new AppError("USER_NOT_FOUND", { field: "username" });
        return profile;
    } catch (err) {
        if (err instanceof AppError) throw err;
        logger.error({ error: err, username }, "Failed to get user profile.")
        throw new AppError("PROFILE_RETRIEVAL_FAILED", { field: "username" })
    }
}

export const searchProfilesService = async (searchQuery: string, limit = 20, cursor?: string): Promise<SearchProfilesResponseDTO> => {
    try {
        const profiles = await searchProfiles(searchQuery, limit, cursor);
        return profiles;
    } catch (err) {
        logger.error({ error: err, searchQuery, limit }, "Failed to search profiles.")
        throw new AppError("PROFILE_SEARCH_FAILED", { field: "search_profiles" })
    }
}

export const updateProfileService = async ({ username, bio }: UpdateProfileParams): Promise<getUserProfileResponseDTO | null> => {
    if (bio !== undefined && typeof bio !== "string") throw new AppError("INVALID_PROFILE_BIO", { field: "bio" })
    if (bio && bio.trim().length > 100) throw new AppError("PROFILE_BIO_LENGTH_EXCEEDED", { field: "bio" })

    try {
        const profile = await updateProfile({ username, bio });
        return profile;
    } catch (err) {
        if (err instanceof AppError) throw err;
        logger.error({ error: err, username, bio }, "Failed to update profile.")
        throw new AppError("PROFILE_UPDATE_FAILED", { field: "profile" })
    }
}
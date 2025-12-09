import { AppError } from "../../errors/customError.js";
import logger from "../../lib/logger.js";
import { getUserProfile } from "./data.js";
import type { getUserProfileResponseDTO } from "./types.js";

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

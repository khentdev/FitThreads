export type getUserProfileResponseDTO = {
    username: string;
    bio: string | null;
    joinedAt: Date;
    totalLikes: number;
}
export type SearchProfilesResponseDTO = {
    users: {
        username: string;
        bio: string | null;
        joinedAt: string;
        totalLikes: number;
    }[];
    nextCursor: string | null;
    hasMore: boolean;
}
export type UpdateProfileParams = {
    username: string
    bio?: string
}
export type UpdateProfileParamsVariables = {
    verifyTokenVariables: UpdateProfileParams
}
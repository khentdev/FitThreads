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
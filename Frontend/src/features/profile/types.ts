export type UserProfile = {
    username: string;
    bio: string | null;
    joinedAt: string;
    totalLikes: number;
}
export type ProfileSearchQueryParams = {
    searchQuery?: string;
    limit?: number;
    cursor?: string
}
export type ProfileSearchResponse = {
    users: UserProfile[]
    nextCursor: string | null,
    hasMore: boolean
}

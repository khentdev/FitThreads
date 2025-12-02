export const getCacheKey = {
    sessionToken: (token: string): string => `session-token-${token}`,
    requestLock: (token: string): string => `session-request-lock-${token}`
}
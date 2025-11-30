export const RedisKeys = {
    signupOTP: (otp: string): string => `otp:signup:${otp}`,
    magicLink: (token: string): string => `otp:magic-link:${token}`,
} as const;

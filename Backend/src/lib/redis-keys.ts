export const RedisKeys = {
    signupOTP: (otp: string): string => `otp:signup:${otp}`,
    magicLink: (email: string): string => `otp:magic-link:${email}`,
} as const;

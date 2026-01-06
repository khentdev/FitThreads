export const RedisKeys = {
    signupOTP: (otp: string): string => `otp:signup:${otp}`,
    magicLink: (token: string): string => `otp:magic-link:${token}`,
    passwordOTP: (token: string): string => `otp:password-reset:${token}`
} as const;

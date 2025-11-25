export const RedisKeys = {
    signupOTP: (otp: string): string => `otp:signup:${otp}`,
} as const;

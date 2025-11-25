import { randomInt } from "crypto";

export const generateOTP = (length: number = 6): string =>
    Array.from({ length: length }, () => randomInt(0, 10)).join('')


export const isValidOTPFormat = (otp: string | unknown, length = 6): otp is string =>
    typeof otp === 'string' && otp.length === length && /^\d+$/.test(otp)

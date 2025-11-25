
export const notEmpty = (value: unknown): boolean =>
    typeof value === "string" && value.trim().length > 0

export const isValidEmail = (email: unknown): boolean => {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return typeof email === "string" && notEmpty(email) && emailRegex.test(email);
}

export const isMinLength = (value: unknown, minLength: number): boolean =>
    typeof value === "string" && value.trim().length >= minLength

export const isWithinMaxLength = (value: unknown, maxLength: number): boolean =>
    typeof value === "string" && value.trim().length <= maxLength && value.trim().length > 0

export const isValidUsername = (value: unknown): boolean => {
    if (typeof value !== "string" || !notEmpty(value)) return false;
    const usernameRegex = /^[a-zA-Z0-9._-]{2,20}$/;
    return usernameRegex.test(value.trim().toLowerCase());
}

export const isValidDeviceFingerprint = (value: unknown): boolean => {
    if (!notEmpty(value)) return false;

    try {
        const parsed = JSON.parse(value as string);
        return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed) && Object.keys(parsed).length > 0;
    } catch {
        return false;
    }
};
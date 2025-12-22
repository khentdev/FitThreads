
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

export const isWithinLengthRange = (value: unknown, minLength: number, maxLength: number): boolean =>
    typeof value === "string" && value.trim().length >= minLength && value.trim().length <= maxLength

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

export const isNotEmptyArray = (value: unknown): value is string[] => {
    return Array.isArray(value) && value.length > 0 && value.every(notEmpty)
}

export const isValidTagsArray = (value: unknown, minTags: number, maxTags: number, minTagLength: number, maxTagLength: number): boolean => {
    if (!Array.isArray(value) || value.length < minTags || value.length > maxTags) return false;
    return value.every(tag => isWithinLengthRange(tag, minTagLength, maxTagLength));
}

export const isValidUUID = (value: unknown): boolean => {
    if (typeof value !== "string" || !notEmpty(value)) return false;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value.trim());
}
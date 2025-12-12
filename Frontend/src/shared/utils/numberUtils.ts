
export const formatCompactNumber = (num: number | undefined | null): string => {
    if (num === undefined || num === null) return '0';

    // Formats a number into a compact string representation with suffixes.
    // Examples:
    // 123 -> "123"
    // 1234 -> "1.2k"
    // 1234567 -> "1.2M"
    return Intl.NumberFormat('en-US', {
        notation: "compact",
        maximumFractionDigits: 1
    }).format(num);
}

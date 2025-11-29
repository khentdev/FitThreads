/**
 * Infrastructure error messages for FitThreads
 */

export const INFRA_ERROR_SERVER_UNREACHABLE = 'INFRA_ERROR_SERVER_UNREACHABLE'
export const INFRA_ERROR_SERVER_ERROR = 'INFRA_ERROR_SERVER_ERROR'
export const INFRA_ERROR_TIMEOUT = 'INFRA_ERROR_TIMEOUT'
export const INFRA_ERROR_OFFLINE = 'INFRA_ERROR_OFFLINE'

export type InfraErrorType = {
    type:
    | typeof INFRA_ERROR_SERVER_UNREACHABLE
    | typeof INFRA_ERROR_SERVER_ERROR
    | typeof INFRA_ERROR_TIMEOUT
    | typeof INFRA_ERROR_OFFLINE
    message: string
}
export const INFRA_MESSAGES = {
    [INFRA_ERROR_OFFLINE]: "You're offline. Check your connection.",
    [INFRA_ERROR_SERVER_UNREACHABLE]: "Can't reach the server. Try again in a moment.",
    [INFRA_ERROR_SERVER_ERROR]: "Something went wrong on our end. We're on it.",
    [INFRA_ERROR_TIMEOUT]: "Request timed out. Try again.",
} as const

export const getInfraErrorMessage = (type: InfraErrorType['type']): string => {
    return INFRA_MESSAGES[type] ?? "Something went wrong. Try again."
}

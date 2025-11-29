import type { AxiosError } from "axios";
import type { ErrorResponse, ErrorReturnType } from "../../../core/errors";
import { getInfraErrorMessage } from "../../../core/infra/messages";

export const authErrorHandler = <C extends string>(err: AxiosError<ErrorResponse<C>>): ErrorReturnType<C> => {

    if (err.code === "ERR_CANCELED") {
        return { retryable: false, message: "Request was canceled", logout: false, type: "", error: err }
    }

    if (err?.code === "ECONNABORTED" || err.response?.status === 408) {
        const message = "Request timeout. Please try again."
        return { retryable: true, message, logout: false, type: "timeout", error: err }
    }

    if (!err.response || err.code === "ERR_NETWORK") {
        const msg = !navigator.onLine ? getInfraErrorMessage("INFRA_ERROR_OFFLINE") : getInfraErrorMessage("INFRA_ERROR_SERVER_UNREACHABLE")
        return {
            type: !navigator.onLine ? 'offline' : 'unreachable',
            retryable: true,
            logout: false,
            message: msg,
            error: err
        }
    }
    if (err.response.data.error.code === "SERVER_ERROR" || !err.response.data.error.code || (err.response.status ?? 0) > 500) {
        const msg = getInfraErrorMessage("INFRA_ERROR_SERVER_ERROR")
        return { retryable: true, logout: false, message: msg, type: "server_error", error: err };
    }

    const { code, field, message, data } = err.response.data.error

    const fallbackMsg = getInfraErrorMessage("INFRA_ERROR_SERVER_ERROR")
    return { retryable: true, logout: false, message: message || fallbackMsg, code, type: "", data: data ?? {}, field, error: err }
}

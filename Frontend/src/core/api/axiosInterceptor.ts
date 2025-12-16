import type { AxiosError, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import type { Router } from 'vue-router'
import type { RefreshSessionErrorCode } from '../../features/auth/errors/authErrorCodes'
import { authService } from '../../features/auth/service'
import { useAuthStore } from '../../features/auth/store/authStore'
import { useToast } from '../../shared/composables/toast/useToast'
import type { ErrorResponse } from '../errors'
import { getCookie } from '../utils/getCookieHelper'
import { getFingerprint } from '../utils/getFingerprint'
import { axiosInstance } from './axiosConfig'

const onRequest = async (
    config: InternalAxiosRequestConfig
) => {
    const authStore = useAuthStore()
    config.headers["X-Fingerprint"] = await getFingerprint()
    config.headers["X-CSRF-Token"] = getCookie("csrfToken")
    config.headers["Authorization"] = `Bearer ${authStore.getAccessToken}`
    return config
}
const onRequestError = (error: AxiosError) => {
    return Promise.reject(error)
}

const onResponse = (response: AxiosResponse) => {
    return response.data
}

const onResponseError = async (error: AxiosError<ErrorResponse>, router: Router) => {
    const authStore = useAuthStore()
    const { toast } = useToast()
    const origRequest = error.config as AxiosRequestConfig & { retry?: boolean }
    const errCode = error.response?.data?.error?.code

    const shouldRetry =
        (errCode === "TOKEN_INVALID" || errCode === "AUTH_USER_NOT_FOUND")
        && !origRequest?.retry
        && error.response?.status === 401

    if (!shouldRetry) return Promise.reject(error)

    origRequest.retry = true
    try {
        const res = await authService.refreshSession()
        authStore.setUser("refreshSession", res)
        if (origRequest.headers) {
            origRequest.headers["Authorization"] = `Bearer ${authStore.getAccessToken}`
        }
        return await axiosInstance(origRequest)
    } catch (refreshError) {
        const axiosErr = refreshError as AxiosError<ErrorResponse<RefreshSessionErrorCode | "AUTH_USER_NOT_FOUND">>
        const refreshErrCode = axiosErr.response?.data?.error?.code
        const isAuthFailure =
            axiosErr.response?.status === 401 && (
                refreshErrCode === "SESSION_UNAUTHORIZED" ||
                refreshErrCode === "TOKEN_INVALID" ||
                refreshErrCode === "TOKEN_EXPIRED" ||
                refreshErrCode === "SESSION_REFRESH_FAILED" ||
                refreshErrCode === "AUTH_USER_NOT_FOUND" ||
                refreshErrCode === "SESSION_LOCK_IN_PROGRESS"
            )
        if (isAuthFailure) {
            authStore.clearUser()
            toast.info("Session expired. Please log in again.")
            if (router) await router.push({ name: "feed" })
            return Promise.reject(refreshError)
        }
        throw refreshError
    }
}

export const setupAxiosInterceptors = (router: Router): void => {
    axiosInstance.interceptors.request.use(onRequest, onRequestError)
    axiosInstance.interceptors.response.use(onResponse, (err) => onResponseError(err, router))
}

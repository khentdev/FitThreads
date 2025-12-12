import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { axiosInstance } from './axiosConfig'
import { getFingerprint } from '../utils/getFingerprint'
import { getCookie } from '../utils/getCookieHelper'
import { useAuthStore } from '../../features/auth/store/authStore'

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

const onResponseError = (error: AxiosError) => {
    return Promise.reject(error)
}

export const setupAxiosInterceptors = (): void => {
    axiosInstance.interceptors.request.use(onRequest, onRequestError)
    axiosInstance.interceptors.response.use(onResponse, onResponseError)
}

import type { AxiosError } from 'axios'
import { defineStore } from 'pinia'
import { computed, reactive, ref } from 'vue'
import type { ErrorResponse } from '../../../core/errors'
import { errorHandler } from '../../../core/errors/errorHandler'
import { useToast } from '../../../shared/composables/toast/useToast'
import type { LoginErrorCode, RefreshSessionErrorCode, ResendOTPErrorCode, SendMagicLinkErrorCode, SignupErrorCode, VerifyMagicLinkErrorCode, VerifyOTPErrorCode } from '../errors/authErrorCodes'
import * as AUTH_CODES from '../errors/authErrorCodes'
import { authService } from '../service'
import type { AuthContext, AuthRefreshSessionResponse, AuthUserLoginResponse, AuthUserSignupResponse, AuthVerifyMagicLinkResponse, AuthVerifyOTPResponse } from '../types'
import { useRouter } from 'vue-router'
import { useQueryClient } from '@tanstack/vue-query'

export const useAuthStore = defineStore('auth', () => {
    const { toast } = useToast()

    const router = useRouter()
    const queryClient = useQueryClient()

    const states = reactive({
        isLoggingIn: false,
        isSigningUp: false,
        isResendingOTP: false,
        isVerifyingOTP: false,
        isSendingMagicLink: false,
        isVerifyingMagicLink: false,
        isRefreshingSession: false,
        sessionInitialized: false,
        isLoggingOut: false
    })

    const systemErrors = reactive({
        sessionError: false,
        rateLimitError: false,
    })

    const errors = reactive({
        usernameError: '',
        emailError: '',
        passwordError: '',
        formError: '',
        otpError: '',
    })


    const user = ref<AuthContext>(null)
    function setUser(type: 'login', data: AuthUserLoginResponse): void
    function setUser(type: 'signup', data: AuthUserSignupResponse): void
    function setUser(type: 'verifyOTP', data: AuthVerifyOTPResponse): void
    function setUser(type: 'magicLink', data: AuthVerifyMagicLinkResponse): void
    function setUser(type: 'refreshSession', data: AuthRefreshSessionResponse): void
    function setUser(
        type: 'login' | 'signup' | 'verifyOTP' | 'magicLink' | 'refreshSession',
        data: AuthUserLoginResponse | AuthUserSignupResponse | AuthVerifyOTPResponse | AuthVerifyMagicLinkResponse | AuthRefreshSessionResponse
    ): void {
        user.value = { type, userData: data } as AuthContext
    }
    const getUsername = computed((): string | null => {
        if (!user.value) return null
        return (user.value.userData as any).user.username
    })
    const getAccessToken = computed((): string | null => {
        if (!user.value) return null
        return (user.value.userData as any).accessToken
    })
    const clearUser = () => {
        user.value = null
    }
    const hasAuthenticated = computed(() => {
        const type = user.value?.type
        return type === 'verifyOTP' || type === 'magicLink' || type === 'refreshSession' || type === "login"
    })
    const clearErrors = () => {
        errors.usernameError = ''
        errors.emailError = ''
        errors.passwordError = ''
        errors.formError = ''
        errors.otpError = ''
    }

    const loginUser = async (username: string, password: string) => {
        if (states.isLoggingIn) return
        clearErrors()
        states.isLoggingIn = true
        try {
            const res = await authService.login({
                username,
                password,
            })
            setUser("login", res)
            toast.success("Logging you in...", { title: `Welcome back, ${res.user.username} 🔥` })
            return { success: true, verified: res.user.emailVerified }
        } catch (err) {
            const axiosErr = err as AxiosError<ErrorResponse<LoginErrorCode>>
            const { message, code, type, error } = errorHandler<LoginErrorCode>(axiosErr)
            if (type === "offline") toast.error("Please check your internet connection and try again.", { title: "You are offline" })
            if (type === "timeout") errors.formError = message
            if (type === "server_error") errors.formError = message
            if (type === "unreachable") errors.formError = message
            if (code === AUTH_CODES.AUTH_USERNAME_REQUIRED) errors.usernameError = message
            if (code === AUTH_CODES.AUTH_USER_NOT_VERIFIED) return { success: false, verified: false, email: error.response?.data?.error?.data?.['email'] }
            if (code === AUTH_CODES.AUTH_INVALID_DEVICE_FINGERPRINT) errors.formError = "Something went wrong on our end. We're on it."
            if (code === AUTH_CODES.AUTH_RATE_LIMIT_LOGIN) errors.formError = message

            const codes = [AUTH_CODES.AUTH_PASSWORD_REQUIRED,
            AUTH_CODES.AUTH_PASSWORD_MIN_LENGTH,
            AUTH_CODES.AUTH_INVALID_CREDENTIALS,
            AUTH_CODES.AUTH_LOGIN_FAILED,
            AUTH_CODES.AUTH_OTP_SEND_FAILED]
            if (code && codes.includes(code)) errors.passwordError = message
            return { success: false, verified: null }
        } finally {
            states.isLoggingIn = false
        }
    }


    const signupUser = async (username: string, emailParam: string, password: string) => {
        if (states.isSigningUp) return
        clearErrors()
        states.isSigningUp = true
        try {
            const res = await authService.signup({
                username,
                email: emailParam,
                password,
            })
            setUser("signup", res)
            return { success: true, email: res.email }
        } catch (err) {
            const axiosErr = err as AxiosError<ErrorResponse<SignupErrorCode>>
            const { message, code, type } = errorHandler<SignupErrorCode>(axiosErr)

            if (type === "offline") toast.error("Please check your internet connection and try again.", { title: "You are offline" })
            if (type === "timeout") errors.formError = message
            if (type === "server_error") errors.formError = message
            if (type === "unreachable") errors.formError = message

            const usernameCodes = [AUTH_CODES.AUTH_USERNAME_REQUIRED,
            AUTH_CODES.AUTH_USERNAME_MAX_LENGTH,
            AUTH_CODES.AUTH_USERNAME_INVALID_FORMAT,
            AUTH_CODES.AUTH_USERNAME_ALREADY_TAKEN]
            if (code && usernameCodes.includes(code)) errors.usernameError = message
            if (code === AUTH_CODES.AUTH_EMAIL_REQUIRED) errors.emailError = message
            if (code === AUTH_CODES.AUTH_PASSWORD_REQUIRED) errors.passwordError = message
            if (code === AUTH_CODES.AUTH_PASSWORD_MIN_LENGTH) errors.passwordError = message
            if (code === AUTH_CODES.AUTH_INVALID_DEVICE_FINGERPRINT) errors.formError = "Something went wrong on our end. We're on it."
            if (code === AUTH_CODES.AUTH_USER_ALREADY_EXISTS) errors.emailError = message
            if (code === AUTH_CODES.AUTH_USER_ALREADY_VERIFIED) errors.formError = message
            if (code === AUTH_CODES.AUTH_ACCOUNT_CREATION_FAILED) errors.formError = message
            if (code === AUTH_CODES.AUTH_OTP_SEND_FAILED) errors.formError = message
            if (code === AUTH_CODES.AUTH_RATE_LIMIT_SIGNUP) errors.formError = message

            return { success: false, email: null }
        } finally {
            states.isSigningUp = false
        }
    }

    const verifyOTP = async (otp: string) => {
        if (states.isVerifyingOTP) return
        clearErrors()
        states.isVerifyingOTP = true

        try {
            const res = await authService.verify(otp)
            setUser("verifyOTP", res)
            toast.success("Logging you in...", { title: "Account verified successfully! 🔥" })
            return { success: true, redirect: null }
        } catch (err) {
            const axiosErr = err as AxiosError<ErrorResponse<VerifyOTPErrorCode>>
            const { message, code, type } = errorHandler<VerifyOTPErrorCode>(axiosErr)
            if (type === "offline") toast.error("Please check your internet connection and try again.", { title: "You are offline" })
            if (type === "timeout") errors.formError = message
            if (type === "server_error") errors.formError = message
            if (type === "unreachable") errors.formError = message

            if (code === AUTH_CODES.AUTH_OTP_INVALID_FORMAT || code === AUTH_CODES.AUTH_OTP_INVALID_OR_EXPIRED) errors.otpError = message
            if (code === AUTH_CODES.AUTH_USER_NOT_FOUND) {
                toast.error("Account not found. Please log in.", { title: "Account not found" })
                return { success: false, redirect: "login" }
            }
            if (code === AUTH_CODES.AUTH_USER_ALREADY_VERIFIED) {
                toast.info("Your account is already verified. Please log in.", { title: "Already verified" })
                return { success: false, redirect: "login" }
            }
            if (code === AUTH_CODES.AUTH_RATE_LIMIT_SIGNUP_VERIFY_OTP) errors.formError = message
            if (code === AUTH_CODES.AUTH_ACCOUNT_CREATION_FAILED || code === AUTH_CODES.AUTH_INVALID_DEVICE_FINGERPRINT) {
                toast.error("Something went wrong. Please try again.", { title: "Something went wrong" })
                return { success: false, redirect: "signup" }
            }
            return { success: false, redirect: null }

        } finally {
            states.isVerifyingOTP = false
        }
    }
    const resendOTP = async (email: string) => {
        if (states.isResendingOTP) return
        states.isResendingOTP = true
        try {
            const res = await authService.resendOTP(email)
            toast.info(res.message, { title: "Verification code sent" })
            return { success: true, redirect: null }
        } catch (err) {
            const axiosErr = err as AxiosError<ErrorResponse<ResendOTPErrorCode>>
            const { message, code, type } = errorHandler<ResendOTPErrorCode>(axiosErr)
            if (type === "offline")
                toast.error("Please check your internet connection and try again.", { title: "You are offline" })

            if (type === "timeout") errors.formError = message
            if (type === "server_error") errors.formError = message
            if (type === "unreachable") errors.formError = message

            if (code === AUTH_CODES.AUTH_EMAIL_REQUIRED)
                errors.otpError = message
            if (code === AUTH_CODES.AUTH_USER_NOT_FOUND) {
                toast.error("Account not found. Please log in.", { title: "Account not found" })
                return { success: false, redirect: "login" }
            }
            if (code === AUTH_CODES.AUTH_USER_ALREADY_VERIFIED) {
                toast.info("Your account is already verified. Please log in.", { title: "Already verified" })
                return { success: false, redirect: "login" }
            }
            if (code === AUTH_CODES.AUTH_OTP_SEND_FAILED) errors.formError = message
            if (code === AUTH_CODES.AUTH_RATE_LIMIT_RESEND_OTP) errors.formError = message

            return { success: false, redirect: null }
        } finally {
            states.isResendingOTP = false
        }
    }

    const sendMagicLink = async (email: string) => {
        if (states.isSendingMagicLink) return
        states.isSendingMagicLink = true
        clearErrors()
        try {
            const res = await authService.sendMagicLink(email)
            toast.success(res.message, { title: "Magic Link Sent" })
            return { success: true }
        } catch (err) {
            const axiosErr = err as AxiosError<ErrorResponse<SendMagicLinkErrorCode>>
            const { message, code, type, error } = errorHandler<SendMagicLinkErrorCode>(axiosErr)

            if (type === "offline") errors.formError = message
            if (type === "timeout") errors.formError = message
            if (type === "server_error") errors.formError = message
            if (type === "unreachable") errors.formError = message

            if (code === AUTH_CODES.AUTH_EMAIL_REQUIRED) errors.emailError = message
            if (code === AUTH_CODES.AUTH_USER_NOT_VERIFIED) {
                toast.error(message, { title: "Account not verified" })
                return { success: false, verified: false, email: error.response?.data?.error?.data?.['email'] }
            }
            if (code === AUTH_CODES.AUTH_SEND_MAGICLINK_FAILED) errors.formError = message
            if (code === AUTH_CODES.AUTH_RATE_LIMIT_MAGIC_LINK) errors.formError = message
            return { success: false }
        } finally {
            states.isSendingMagicLink = false
        }
    }

    const verifyMagicLinkToken = async (token: string) => {
        if (states.isVerifyingMagicLink) return
        states.isVerifyingMagicLink = true
        clearErrors()
        try {
            const res = await authService.verifyMagicLink(token)
            setUser("magicLink", res)
            toast.success("Logging you in...", { title: `Welcome back, ${res.user.username} 🔥` })
            return { success: true }
        } catch (err) {
            const axiosErr = err as AxiosError<ErrorResponse<VerifyMagicLinkErrorCode>>
            const { message, code, type } = errorHandler<VerifyMagicLinkErrorCode>(axiosErr)

            if (type === "offline") {
                toast.error("Please check your internet connection and try again.", { title: "You are offline" })
                return { success: false, redirect: "login" }
            }
            if (type === "timeout") {
                toast.error("The request timed out. Please try again.", { title: "Request timed out" })
                return { success: false, redirect: "login" }
            }
            if (type === "server_error") {
                toast.error("Something went wrong on our end. Please try again.", { title: "Server error" })
                return { success: false, redirect: "login" }
            }
            if (type === "unreachable") {
                toast.error("Couldn't reach the server. Check your connection and try again.", { title: "Connection failed" })
                return { success: false, redirect: "login" }
            }

            if (code === AUTH_CODES.AUTH_MAGIC_LINK_INVALID_OR_EXPIRED) {
                toast.error(message, { title: "Invalid Link" })
                return { success: false, redirect: "magic-link" }
            }
            if (code === AUTH_CODES.AUTH_USER_NOT_FOUND) {
                toast.error("Account not found. Please log in.", { title: "Account not found" })
                return { success: false, redirect: "signup" }
            }
            if (code === AUTH_CODES.AUTH_LOGIN_FAILED) {
                toast.error(message, { title: "Login failed" })
                return { success: false, redirect: "login" }
            }
            if (code === AUTH_CODES.AUTH_INVALID_DEVICE_FINGERPRINT) {
                toast.error("Something went wrong on our end. We're on it.", { title: "Something went wrong" })
                return { success: false, redirect: "login" }
            }
            return { success: false, redirect: null }
        } finally {
            states.isVerifyingMagicLink = false
        }
    }

    let refreshPromise: Promise<{ success: boolean, logout: boolean, }> | null = null
    const refreshSession = async () => {
        if (states.isRefreshingSession && refreshPromise) return refreshPromise
        states.isRefreshingSession = true

        refreshPromise = (async () => {
            const MAX_RETRIES = 5

            for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
                try {
                    const res = await authService.refreshSession()
                    setUser("refreshSession", res)
                    systemErrors.sessionError = false
                    return { success: true, logout: false }
                } catch (error) {
                    const axiosErr = error as AxiosError<ErrorResponse<RefreshSessionErrorCode>>
                    const { code, type } = errorHandler<RefreshSessionErrorCode>(axiosErr)
                    if (code === AUTH_CODES.SESSION_LOCK_IN_PROGRESS && attempt < MAX_RETRIES - 1) {
                        const baseDelay = 500
                        const maxDelay = 3000;
                        let delay = Math.min(baseDelay * (2 ** attempt), maxDelay);
                        const jitter = Math.random() * 200;
                        await new Promise(r => setTimeout(r, delay + jitter));
                        continue;
                    }

                    const sessionFailureCodes = [
                        AUTH_CODES.SESSION_UNAUTHORIZED,
                        AUTH_CODES.TOKEN_INVALID,
                        AUTH_CODES.TOKEN_EXPIRED
                    ]

                    if (code && sessionFailureCodes.includes(code)) {
                        clearUser()
                        systemErrors.sessionError = false
                        return { success: false, logout: true }
                    }

                    if (code === AUTH_CODES.RATELIMIT_SESSION_EXCEEDED) {
                        // systemErrors.rateLimitError = true
                        return { success: false, logout: false }
                    }

                    if (type === "offline" || type === "server_error" || type === "unreachable" || type === "timeout") {
                        systemErrors.sessionError = true
                        return { success: false, logout: false }
                    }
                    return { success: false, logout: true }
                }
            }
            return { success: false, logout: true }
        })()

        try {
            return await refreshPromise
        } finally {
            refreshPromise = null
            states.sessionInitialized = true
            states.isRefreshingSession = false
        }
    }

    const logoutSession = async () => {
        if (states.isLoggingOut) return
        states.isLoggingOut = true
        try {
            await authService.logoutSession()
            return { success: true }
        } catch (err) {
            return { success: false }
        } finally {
            clearUser()
            await queryClient.invalidateQueries()
            await router.push({ name: "feed" })
            states.isLoggingOut = false
        }
    }

    return {
        hasAuthenticated,
        getUsername,
        getAccessToken,
        errors,
        setUser,
        clearUser,
        clearErrors,
        loginUser,
        signupUser,
        verifyOTP,
        resendOTP,
        sendMagicLink,
        verifyMagicLinkToken,
        refreshSession,
        states,
        systemErrors,
        logoutSession
    }
})

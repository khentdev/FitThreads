import { defineStore } from 'pinia'
import { reactive, ref } from 'vue'
import type { AuthContext, AuthUserData, AuthUserLoginResponse, AuthUserSignupResponse, AuthVerifyOTPResponse } from '../types'
import { authService } from '../service'
import { authErrorHandler } from '../errors/authErrorHandler'
import type { LoginErrorCode, ResendOTPErrorCode, SignupErrorCode, VerifyOTPErrorCode } from '../errors/authErrorCodes'
import * as AUTH_CODES from '../errors/authErrorCodes'
import type { AxiosError } from 'axios'
import type { ErrorResponse } from '../../../core/errors'
import { useToast } from '../../../shared/composables/toast/useToast'

export const useAuthStore = defineStore('auth', () => {
    const { toast } = useToast()

    const states = reactive({
        isLoggingIn: false,
        isSigningUp: false,
        isResendingOTP: false,
        isVerifyingOTP: false,
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
    function setUser(
        type: 'login' | 'signup' | 'verifyOTP',
        data: AuthUserLoginResponse | AuthUserSignupResponse | AuthVerifyOTPResponse
    ): void {
        user.value = { type, userData: data } as AuthContext
    }
    const getUserData = <T extends keyof AuthUserData>(type: T): AuthUserData[T] | null =>
        user.value?.type === type ? user.value?.userData as AuthUserData[T] : null

    const clearUser = () => {
        user.value = null
    }

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
            const { message, code, type, error } = authErrorHandler<LoginErrorCode>(axiosErr)
            if (type === "offline") toast.error("Please check your internet connection and try again.", { title: "You are offline" })
            if (type === "timeout") errors.formError = message
            if (type === "server_error") errors.formError = message
            if (type === "unreachable") errors.formError = message
            if (code === AUTH_CODES.AUTH_USERNAME_REQUIRED) errors.usernameError = message
            if (code === AUTH_CODES.AUTH_USER_NOT_VERIFIED) return { success: false, verified: false, email: error.response?.data?.error?.data?.['email'] }
            if (code === AUTH_CODES.AUTH_INVALID_DEVICE_FINGERPRINT) errors.formError = "Something went wrong on our end. We're on it."
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
            const { message, code, type } = authErrorHandler<SignupErrorCode>(axiosErr)

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
            const { message, code, type } = authErrorHandler<VerifyOTPErrorCode>(axiosErr)
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
            const { message, code, type } = authErrorHandler<ResendOTPErrorCode>(axiosErr)
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
            return { success: false, redirect: null }
        } finally {
            states.isResendingOTP = false
        }
    }

    return {
        getUserData,
        errors,
        setUser,
        clearUser,
        clearErrors,
        loginUser,
        signupUser,
        verifyOTP,
        resendOTP,
        states,
    }
})

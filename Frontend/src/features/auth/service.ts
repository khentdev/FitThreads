import { axiosInstance } from "../../core/api/axiosConfig";
import { getTypedResponse } from "../../shared/types/types";
import type { LoginCredentials, SignupCredentials, AuthUserLoginResponse, AuthUserSignupResponse, AuthVerifyOTPResponse, AuthResendOTPResponse, AuthSendMagicLinkResponse, AuthVerifyMagicLinkResponse } from "./types";

export const authService = {
    login: async (credentials: LoginCredentials) => {
        const response = await axiosInstance.post('/auth/login', credentials)
        return getTypedResponse<AuthUserLoginResponse>(response)
    },
    signup: async (credentials: SignupCredentials) => {
        const response = await axiosInstance.post('/auth/signup/send-otp', credentials)
        return getTypedResponse<AuthUserSignupResponse>(response)
    },
    verify: async (otp: string) => {
        const response = await axiosInstance.post('/auth/signup/verify', { otp })
        return getTypedResponse<AuthVerifyOTPResponse>(response)
    },
    resendOTP: async (email: string) => {
        const response = await axiosInstance.post('/auth/verify/resend-otp', { email })
        return getTypedResponse<AuthResendOTPResponse>(response)
    },
    sendMagicLink: async (email: string) => {
        const response = await axiosInstance.post('/auth/magic-link', { email })
        return getTypedResponse<AuthSendMagicLinkResponse>(response)
    },
    verifyMagicLink: async (token: string) => {
        const response = await axiosInstance.post('/auth/magic-link/verify', { token })
        return getTypedResponse<AuthVerifyMagicLinkResponse>(response)
    }
}

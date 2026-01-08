export type LoginCredentials = {
    username: string
    password: string
}

export type SignupCredentials = {
    username: string
    email: string
    password: string
}

export type User = {
    username: string
    email: string
    emailVerified: boolean
}

export type AuthUserLoginResponse = {
    message: string,
    accessToken: string
    user: User
}

export type AuthUserSignupResponse = {
    message: string
    email: string
}

export type AuthVerifyOTPResponse = {
    message: string
    accessToken: string
    user: User
}

export type AuthResendOTPResponse = {
    message: string
}

export type AuthSendMagicLinkResponse = {
    message: string
    email: string
}

export type AuthVerifyMagicLinkResponse = {
    message: string
    accessToken: string
    user: User
}

export type AuthRefreshSessionResponse = {
    accessToken: string
    user: User
}

export type AuthSendPasswordResetLinkResponse = {
    message: string
    email: string
}
export type AuthVerifyPasswordResetTokenParams = {
    token: string
    newPassword: string,
    confirmPassword: string
}
export type AuthVerifyPasswordResetTokenResponse = {
    message: string
    accessToken: string
    user: User
}

export type AuthUserData = {
    login: AuthUserLoginResponse
    signup: AuthUserSignupResponse
    verifyOTP: AuthVerifyOTPResponse
    magicLink: AuthVerifyMagicLinkResponse
    refreshSession: AuthRefreshSessionResponse
}

export type AuthContext =
    | { type: 'login'; userData: AuthUserLoginResponse }
    | { type: 'signup'; userData: AuthUserSignupResponse }
    | { type: 'verifyOTP'; userData: AuthVerifyOTPResponse }
    | { type: 'magicLink'; userData: AuthVerifyMagicLinkResponse }
    | { type: 'refreshSession'; userData: AuthRefreshSessionResponse }
    | { type: "passwordReset"; userData: AuthVerifyPasswordResetTokenResponse } | null
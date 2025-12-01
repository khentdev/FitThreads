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

export type AuthUserData = {
    login: AuthUserLoginResponse
    signup: AuthUserSignupResponse
    verifyOTP: AuthVerifyOTPResponse
    magicLink: AuthVerifyMagicLinkResponse
}

export type AuthContext =
    | { type: 'login'; userData: AuthUserLoginResponse }
    | { type: 'signup'; userData: AuthUserSignupResponse }
    | { type: 'verifyOTP'; userData: AuthVerifyOTPResponse }
    | { type: 'magicLink'; userData: AuthVerifyMagicLinkResponse }
    | null
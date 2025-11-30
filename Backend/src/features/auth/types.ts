
export type SendOTPRequestBody = {
    username: unknown;
    email: unknown;
    password: unknown;
}

export type SendOTPParams = {
    username: string;
    email: string;
    password: string;
}

export type SendOTPParamsVariables = {
    sendOTPParams: SendOTPParams;
}

export type VerifyEmailAndCreateSessionRequestBody = {
    otp: unknown;
}

export type VerifyEmailAndCreateSessionParams = {
    deviceId: string;
    otp: string;
}

export type VerifyEmailAndCreateSessionParamsVariables = {
    verifyOTPParams: VerifyEmailAndCreateSessionParams;
}

export type LoginRequestBody = {
    username: unknown;
    password: unknown;
}

export type LoginParams = {
    username: string;
    password: string;
    deviceId: string
}

export type LoginParamsVariables = {
    loginParams: LoginParams;
}

export type ResendOTPRequestBody = {
    email: unknown;
}

export type ResendOTPParams = {
    email: string;
}

export type ResendOTPParamsVariables = {
    resendOTPParams: ResendOTPParams;
}

export type VerifyMagicLinkRequestBody = {
    token: unknown;
}

export type VerifyMagicLinkParams = {
    token: string;
    deviceId: string;
}

export type VerifyMagicLinkParamsVariables = {
    verifyMagicLinkParams: VerifyMagicLinkParams;
}

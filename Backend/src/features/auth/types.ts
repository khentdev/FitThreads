
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

export type VerifyOTPAndCreateAccountRequestBody = {
    otp: unknown;
}

export type VerifyOTPAndCreateAccountParams = {
    deviceId: string;
    otp: string;
}

export type VerifyOTPAndCreateAccountParamsVariables = {
    verifyOTPParams: VerifyOTPAndCreateAccountParams;
}
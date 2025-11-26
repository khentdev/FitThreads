import { Hono } from "hono";
import {
    deleteUserByEmailController,
    loginController,
    sendAccountVerificationOTPController,
    verifyEmailAndCreateSessionController,
    resendVerificationOTPController,
} from "./controller.js";
import {
    validateLoginAccount,
    validateSendOTP,
    validateVerifyOTPAndCreateAccount,
    validateResendOTP,
} from "./middleware.js";

const authRouter = new Hono().basePath("/auth")

authRouter
    .delete("/delete/user", deleteUserByEmailController)
    .post("/signup/send-otp", validateSendOTP, sendAccountVerificationOTPController)
    .post("/signup/verify", validateVerifyOTPAndCreateAccount, verifyEmailAndCreateSessionController)
    .post("/login", validateLoginAccount, loginController)
    .post("/verify/resend-otp", validateResendOTP, resendVerificationOTPController)

export default authRouter;

import { Hono } from "hono";
import {
    deleteUserByEmailController,
    sendAccountVerificationOTPController,
    verifyOTPAndCreateAccountController
} from "./controller.js";
import {
    validateSendOTP,
    validateVerifyOTPAndCreateAccount
} from "./middleware.js";

const authRouter = new Hono().basePath("/auth")
authRouter.delete("delete/user", deleteUserByEmailController)

authRouter.post("/signup/send-otp", validateSendOTP, sendAccountVerificationOTPController)
    .post("/signup/verify", validateVerifyOTPAndCreateAccount, verifyOTPAndCreateAccountController);
export default authRouter;

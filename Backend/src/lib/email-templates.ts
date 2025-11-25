
type EmailTemplate = {
    subject: string;
    html: string;
    text: string;
};

export const emailTemplates = {
    signupOTP: (otp: string): EmailTemplate => ({
        subject: "Verify your FitThreads account",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Welcome to FitThreads!</h2>
                <p>Your verification code is:</p>
                <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 20px 0;">
                    ${otp}
                </div>
                <p>This code will expire in <strong>10 minutes</strong>.</p>
                <p>If you didn't request this code, please ignore this email.</p>
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
                <p style="color: #666; font-size: 12px;">FitThreads - Authentic fitness thoughts</p>
            </div>
        `,
        text: `Welcome to FitThreads!\n\nYour verification code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this code, please ignore this email.\n\n---\nFitThreads - Authentic fitness thoughts`,
    }),
} as const;

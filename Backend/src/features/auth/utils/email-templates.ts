
type EmailTemplate = {
    subject: string;
    html: string;
    text: string;
};

export const emailTemplates = {
    signupOTP: (otp: string): EmailTemplate => ({
        subject: "Verify your FitThreads account",
        html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Verify your FitThreads account</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif; background-color: hsl(40, 27%, 97%); color: hsl(0, 0%, 13%);">
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td align="center" style="padding: 48px 24px;">
                            <table role="presentation" style="width: 100%; max-width: 480px; border-collapse: collapse;">
                                <tr>
                                    <td style="padding-bottom: 32px;">
                                        <h1 style="margin: 0; font-size: 24px; font-weight: 600; line-height: 32px; color: hsl(0, 0%, 13%);">FitThreads</h1>
                                    </td>
                                </tr>
                                
                                <tr>
                                    <td style="padding-bottom: 24px;">
                                        <h2 style="margin: 0; font-size: 18px; font-weight: 500; line-height: 24px; color: hsl(0, 0%, 13%);">Verify your account</h2>
                                    </td>
                                </tr>
                                
                                <tr>
                                    <td style="padding-bottom: 24px;">
                                        <p style="margin: 0; font-size: 15px; line-height: 24px; color: hsl(30, 7%, 45%);">Enter this code to complete your FitThreads signup:</p>
                                    </td>
                                </tr>
                                
                                <tr>
                                    <td style="padding: 24px 0;">
                                        <div style="background-color: hsl(0, 0%, 100%); border: 1px solid hsl(0, 0%, 87%); border-radius: 8px; padding: 32px; text-align: center;">
                                            <div style="font-size: 36px; font-weight: 600; letter-spacing: 8px; color: hsl(198, 74%, 48%); line-height: 48px;">${otp}</div>
                                        </div>
                                    </td>
                                </tr>
                                
                                <tr>
                                    <td style="padding-bottom: 32px;">
                                        <p style="margin: 0; font-size: 14px; line-height: 20px; color: hsl(30, 7%, 45%);">This code expires in <strong style="color: hsl(0, 0%, 13%);">10 minutes</strong>.</p>
                                    </td>
                                </tr>
                                
                                <tr>
                                    <td style="padding-bottom: 40px; border-top: 1px solid hsl(0, 0%, 87%); padding-top: 24px;">
                                        <p style="margin: 0; font-size: 14px; line-height: 20px; color: hsl(30, 7%, 45%);">Didn't request this code? You can safely ignore this email.</p>
                                    </td>
                                </tr>
                                
                                <tr>
                                    <td>
                                        <p style="margin: 0; font-size: 13px; line-height: 20px; color: hsl(30, 7%, 55%);">FitThreads — Authentic fitness thoughts</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
        `,
        text: `FitThreads

Verify your account

Enter this code to complete your FitThreads signup:

${otp}

This code expires in 10 minutes.

Didn't request this code? You can safely ignore this email.

---
FitThreads — Authentic fitness thoughts`,
    }),
    magicLink: (magicLink: string): EmailTemplate => ({
        subject: "Sign in to FitThreads",
        html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Sign in to FitThreads</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif; background-color: hsl(40, 27%, 97%); color: hsl(0, 0%, 13%);">
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td align="center" style="padding: 48px 24px;">
                            <table role="presentation" style="width: 100%; max-width: 480px; border-collapse: collapse;">
                                <tr>
                                    <td style="padding-bottom: 32px;">
                                        <h1 style="margin: 0; font-size: 24px; font-weight: 600; line-height: 32px; color: hsl(0, 0%, 13%);">FitThreads</h1>
                                    </td>
                                </tr>
                                
                                <tr>
                                    <td style="padding-bottom: 24px;">
                                        <h2 style="margin: 0; font-size: 18px; font-weight: 500; line-height: 24px; color: hsl(0, 0%, 13%);">Sign in to your account</h2>
                                    </td>
                                </tr>
                                
                                <tr>
                                    <td style="padding-bottom: 24px;">
                                        <p style="margin: 0; font-size: 15px; line-height: 24px; color: hsl(30, 7%, 45%);">Click the button below to sign in to FitThreads:</p>
                                    </td>
                                </tr>
                                
                                <tr>
                                    <td style="padding: 24px 0;">
                                        <table role="presentation" style="margin: 0 auto;">
                                            <tr>
                                                <td style="border-radius: 8px; background-color: hsl(198, 74%, 48%);">
                                                    <a href="${magicLink}" style="display: inline-block; padding: 16px 32px; font-size: 15px; font-weight: 500; color: hsl(0, 0%, 100%); text-decoration: none; border-radius: 8px;">Sign in to FitThreads</a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                
                                <tr>
                                    <td style="padding-bottom: 32px;">
                                        <p style="margin: 0; font-size: 14px; line-height: 20px; color: hsl(30, 7%, 45%);">This link expires in <strong style="color: hsl(0, 0%, 13%);">15 minutes</strong> and can only be used once.</p>
                                    </td>
                                </tr>
                                
                                <tr>
                                    <td style="padding-bottom: 24px;">
                                        <p style="margin: 0 0 8px 0; font-size: 14px; line-height: 20px; color: hsl(30, 7%, 45%);">Or copy and paste this link into your browser:</p>
                                        <div style="background-color: hsl(0, 0%, 100%); border: 1px solid hsl(0, 0%, 87%); border-radius: 8px; padding: 16px; word-break: break-all;">
                                            <a href="${magicLink}" style="font-size: 13px; color: hsl(198, 74%, 48%); text-decoration: none;">${magicLink}</a>
                                        </div>
                                    </td>
                                </tr>
                                
                                <tr>
                                    <td style="padding-bottom: 40px; border-top: 1px solid hsl(0, 0%, 87%); padding-top: 24px;">
                                        <p style="margin: 0; font-size: 14px; line-height: 20px; color: hsl(30, 7%, 45%);">Didn't request this link? You can safely ignore this email.</p>
                                    </td>
                                </tr>
                                
                                <tr>
                                    <td>
                                        <p style="margin: 0; font-size: 13px; line-height: 20px; color: hsl(30, 7%, 55%);">FitThreads — Authentic fitness thoughts</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
        `,
        text: `FitThreads

Sign in to your account

Click this link to sign in to FitThreads:

${magicLink}

This link expires in 10 minutes and can only be used once.

Didn't request this link? You can safely ignore this email.

---
FitThreads — Authentic fitness thoughts`,
    }),
    passwordReset: (passwordResetLink: string): EmailTemplate => ({
        subject: "Reset your FitThreads password",
        html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Reset your FitThreads password</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif; background-color: hsl(40, 27%, 97%); color: hsl(0, 0%, 13%);">
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td align="center" style="padding: 48px 24px;">
                            <table role="presentation" style="width: 100%; max-width: 480px; border-collapse: collapse;">
                                <tr>
                                    <td style="padding-bottom: 32px;">
                                        <h1 style="margin: 0; font-size: 24px; font-weight: 600; line-height: 32px; color: hsl(0, 0%, 13%);">FitThreads</h1>
                                    </td>
                                </tr>
                                
                                <tr>
                                    <td style="padding-bottom: 24px;">
                                        <h2 style="margin: 0; font-size: 18px; font-weight: 500; line-height: 24px; color: hsl(0, 0%, 13%);">Reset your password</h2>
                                    </td>
                                </tr>
                                
                                <tr>
                                    <td style="padding-bottom: 24px;">
                                        <p style="margin: 0; font-size: 15px; line-height: 24px; color: hsl(30, 7%, 45%);">Click the button below to reset your password:</p>
                                    </td>
                                </tr>
                                
                                <tr>
                                    <td style="padding: 24px 0;">
                                        <table role="presentation" style="margin: 0 auto;">
                                            <tr>
                                                <td style="border-radius: 8px; background-color: hsl(198, 74%, 48%);">
                                                    <a href="${passwordResetLink}" style="display: inline-block; padding: 16px 32px; font-size: 15px; font-weight: 500; color: hsl(0, 0%, 100%); text-decoration: none; border-radius: 8px;">Reset password</a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                
                                <tr>
                                    <td style="padding-bottom: 32px;">
                                        <p style="margin: 0; font-size: 14px; line-height: 20px; color: hsl(30, 7%, 45%);">This link expires in <strong style="color: hsl(0, 0%, 13%);">10 minutes</strong> and can only be used once.</p>
                                    </td>
                                </tr>
                                
                                <tr>
                                    <td style="padding-bottom: 24px;">
                                        <p style="margin: 0 0 8px 0; font-size: 14px; line-height: 20px; color: hsl(30, 7%, 45%);">Or copy and paste this link into your browser:</p>
                                        <div style="background-color: hsl(0, 0%, 100%); border: 1px solid hsl(0, 0%, 87%); border-radius: 8px; padding: 16px; word-break: break-all;">
                                            <a href="${passwordResetLink}" style="font-size: 13px; color: hsl(198, 74%, 48%); text-decoration: none;">${passwordResetLink}</a>
                                        </div>
                                    </td>
                                </tr>
                                
                                <tr>
                                    <td style="padding-bottom: 40px; border-top: 1px solid hsl(0, 0%, 87%); padding-top: 24px;">
                                        <p style="margin: 0; font-size: 14px; line-height: 20px; color: hsl(30, 7%, 45%);">Didn't request this link? You can safely ignore this email.</p>
                                    </td>
                                </tr>
                                
                                <tr>
                                    <td>
                                        <p style="margin: 0; font-size: 13px; line-height: 20px; color: hsl(30, 7%, 55%);">FitThreads — Authentic fitness thoughts</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
        `,
        text: `FitThreads

Reset your password

Click this link to reset your password:

${passwordResetLink}

This link expires in 10 minutes and can only be used once.

Didn't request this link? You can safely ignore this email.

---
FitThreads — Authentic fitness thoughts`,
    }),
} as const;

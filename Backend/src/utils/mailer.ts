import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export async function sendMail(
    to: string,
    resetUrl: string
) {
    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to,
        subject: "Reset your password",
        html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. Link valid for 15 minutes.</p>`,
        text: `Reset your password: ${resetUrl}`,
    };

    return transporter.sendMail(mailOptions);
}

// new — generic sender for feedbacks / other emails
export async function sendEmail(
    to: string,
    subject: string,
    text: string,
    html?: string
) {
    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to,
        subject,
        text,
        html: html || `<pre>${text}</pre>`,
    };

    return transporter.sendMail(mailOptions);
}

/**
 * Send payment success notification email
 */
export async function sendPaymentSuccessEmail(
    userEmail: string,
    userName: string,
    plan: string,
    amount: number,
    startDate: Date,
    expiryDate: Date,
    orderId: string
) {
    const subject = "🎉 Payment Successful - SmartLibrary Subscription Activated";
    
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #0f172a; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                <h1>Payment Successful! ✅</h1>
                <p>Your subscription has been activated</p>
            </div>
            
            <div style="padding: 20px; background-color: #f9f9f9; border: 1px solid #ddd; border-top: none;">
                <h2>Dear ${userName},</h2>
                
                <p>Thank you for your payment! Your SmartLibrary subscription is now active.</p>
                
                <div style="background-color: white; padding: 15px; border-left: 4px solid #0f172a; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #0f172a;">Subscription Details</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr style="border-bottom: 1px solid #eee;">
                            <td style="padding: 10px; font-weight: bold;">Plan:</td>
                            <td style="padding: 10px;">${plan}</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #eee;">
                            <td style="padding: 10px; font-weight: bold;">Amount Paid:</td>
                            <td style="padding: 10px;">₹${amount}</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #eee;">
                            <td style="padding: 10px; font-weight: bold;">Start Date:</td>
                            <td style="padding: 10px;">${new Date(startDate).toLocaleDateString()}</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #eee;">
                            <td style="padding: 10px; font-weight: bold;">Expiry Date:</td>
                            <td style="padding: 10px;">${new Date(expiryDate).toLocaleDateString()}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; font-weight: bold;">Order ID:</td>
                            <td style="padding: 10px; font-family: monospace;">${orderId}</td>
                        </tr>
                    </table>
                </div>
                
                <p style="margin-top: 20px;">
                    <strong>What's Next?</strong><br>
                    You can now access all premium features of SmartLibrary. Log in to your account to get started.
                </p>
                
                <p style="color: #666; font-size: 14px;">
                    If you have any questions or need support, please contact us at support@smartlibrary.com
                </p>
                
                <div style="text-align: center; padding-top: 20px; border-top: 1px solid #eee; margin-top: 20px; color: #999; font-size: 12px;">
                    <p>© 2024 SmartLibrary. All rights reserved.</p>
                </div>
            </div>
        </div>
    `;

    const text = `
Payment Successful!

Dear ${userName},

Thank you for your payment! Your SmartLibrary subscription is now active.

Subscription Details:
- Plan: ${plan}
- Amount Paid: ₹${amount}
- Start Date: ${new Date(startDate).toLocaleDateString()}
- Expiry Date: ${new Date(expiryDate).toLocaleDateString()}
- Order ID: ${orderId}

You can now access all premium features. Log in to get started!

If you have any questions, contact support@smartlibrary.com

© 2024 SmartLibrary
    `;

    try {
        await sendEmail(userEmail, subject, text, html);
        console.log(`✅ Payment success email sent to ${userEmail}`);
    } catch (error) {
        console.error(`❌ Failed to send payment email to ${userEmail}:`, error);
        throw new Error("Failed to send payment confirmation email");
    }
}

/**
 * Send payment failure notification email
 */
export async function sendPaymentFailureEmail(
    userEmail: string,
    userName: string,
    plan: string,
    amount: number,
    orderId: string,
    reason?: string
) {
    const subject = "❌ Payment Failed - SmartLibrary";
    
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                <h1>Payment Failed ❌</h1>
                <p>Your payment could not be processed</p>
            </div>
            
            <div style="padding: 20px; background-color: #f9f9f9; border: 1px solid #ddd; border-top: none;">
                <h2>Dear ${userName},</h2>
                
                <p>Unfortunately, your payment could not be processed. Please try again.</p>
                
                <div style="background-color: white; padding: 15px; border-left: 4px solid #dc2626; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #dc2626;">Failed Transaction Details</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr style="border-bottom: 1px solid #eee;">
                            <td style="padding: 10px; font-weight: bold;">Plan:</td>
                            <td style="padding: 10px;">${plan}</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #eee;">
                            <td style="padding: 10px; font-weight: bold;">Amount:</td>
                            <td style="padding: 10px;">₹${amount}</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #eee;">
                            <td style="padding: 10px; font-weight: bold;">Order ID:</td>
                            <td style="padding: 10px; font-family: monospace;">${orderId}</td>
                        </tr>
                        ${reason ? `<tr>
                            <td style="padding: 10px; font-weight: bold;">Reason:</td>
                            <td style="padding: 10px;">${reason}</td>
                        </tr>` : ''}
                    </table>
                </div>
                
                <p style="margin-top: 20px;">
                    <strong>What can you do?</strong><br>
                    • Check your payment details and try again<br>
                    • Use a different payment method<br>
                    • Contact your bank if the issue persists
                </p>
                
                <p style="color: #666; font-size: 14px;">
                    For support, please contact us at support@smartlibrary.com or call our helpline.
                </p>
                
                <div style="text-align: center; padding-top: 20px; border-top: 1px solid #eee; margin-top: 20px; color: #999; font-size: 12px;">
                    <p>© 2024 SmartLibrary. All rights reserved.</p>
                </div>
            </div>
        </div>
    `;

    const text = `
Payment Failed

Dear ${userName},

Unfortunately, your payment could not be processed.

Failed Transaction Details:
- Plan: ${plan}
- Amount: ₹${amount}
- Order ID: ${orderId}
${reason ? `- Reason: ${reason}` : ''}

Please try again with valid payment details.

For support, contact support@smartlibrary.com

© 2024 SmartLibrary
    `;

    try {
        await sendEmail(userEmail, subject, text, html);
        console.log(`✅ Payment failure email sent to ${userEmail}`);
    } catch (error) {
        console.error(`❌ Failed to send payment failure email to ${userEmail}:`, error);
    }
}
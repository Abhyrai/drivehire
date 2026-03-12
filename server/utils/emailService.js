/**
 * Email service using Resend (HTTP-based — works on Render)
 * Docs: https://resend.com/docs/send-with-nodejs
 */

const { Resend } = require('resend');

const getResend = () => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        console.warn('⚠️ RESEND_API_KEY not set — emails will be logged to console');
        return null;
    }
    return new Resend(apiKey);
};

/**
 * Send an email via Resend. Falls back to console.log if API key is missing.
 */
const sendEmail = async ({ to, subject, html }) => {
    const resend = getResend();

    if (!resend) {
        console.log(`📧 [Email Simulation] To: ${to} | Subject: ${subject}`);
        console.log(`   Body: ${html.substring(0, 200)}...`);
        return { success: true, simulated: true };
    }

    try {
        const { data, error } = await resend.emails.send({
            from: 'DriveHire <onboarding@resend.dev>',
            to,
            subject,
            html
        });

        if (error) {
            console.error('Resend error:', error);
            throw new Error(error.message);
        }

        console.log(`✅ Email sent to ${to} — ID: ${data?.id}`);
        return { success: true, id: data?.id };
    } catch (err) {
        console.error('Email send failed:', err.message);
        throw err;
    }
};

/**
 * Password reset email template
 */
const sendPasswordResetEmail = async (email, resetToken, clientUrl) => {
    const resetLink = `${clientUrl}/reset-password?token=${resetToken}`;

    return sendEmail({
        to: email,
        subject: '🔐 Reset Your DriveHire Password',
        html: `
        <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:32px;color:#333">
            <div style="text-align:center;margin-bottom:24px">
                <h1 style="color:#6c5ce7;margin:0">🚗 DriveHire</h1>
                <p style="color:#666;margin:4px 0">Password Reset Request</p>
            </div>
            <p>Hello,</p>
            <p>We received a request to reset your password. Click the button below to set a new password:</p>
            <div style="text-align:center;margin:24px 0">
                <a href="${resetLink}" style="background:#6c5ce7;color:white;padding:12px 32px;text-decoration:none;border-radius:8px;font-weight:700;display:inline-block">
                    Reset Password
                </a>
            </div>
            <p style="font-size:13px;color:#999">This link expires in <strong>30 minutes</strong>.</p>
            <p style="font-size:13px;color:#999">If you didn't request this, you can safely ignore this email.</p>
            <hr style="border:none;border-top:1px solid #eee;margin:24px 0" />
            <p style="font-size:12px;color:#bbb;text-align:center">DriveHire — On-Demand Driver Hiring Platform</p>
        </div>`
    });
};

/**
 * Welcome email for new registrations
 */
const sendWelcomeEmail = async (email, name, role) => {
    const dashboardPath = role === 'driver' ? '/driver' : '/customer';

    return sendEmail({
        to: email,
        subject: '🎉 Welcome to DriveHire!',
        html: `
        <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:32px;color:#333">
            <div style="text-align:center;margin-bottom:24px">
                <h1 style="color:#6c5ce7;margin:0">🚗 DriveHire</h1>
            </div>
            <h2>Welcome, ${name}! 🎉</h2>
            <p>Your ${role} account has been created successfully. You're all set to ${role === 'driver' ? 'start earning by driving' : 'hire professional drivers'} on DriveHire.</p>
            ${role === 'driver' ? '<p>📄 <strong>Next step:</strong> Upload your documents (Aadhaar, Driving License) for verification.</p>' : '<p>🚗 <strong>Next step:</strong> Add your vehicle and search for available drivers near you.</p>'}
            <div style="text-align:center;margin:24px 0">
                <a href="${process.env.CLIENT_URL || 'https://drivehire.vercel.app'}${dashboardPath}" style="background:#6c5ce7;color:white;padding:12px 32px;text-decoration:none;border-radius:8px;font-weight:700;display:inline-block">
                    Go to Dashboard
                </a>
            </div>
            <hr style="border:none;border-top:1px solid #eee;margin:24px 0" />
            <p style="font-size:12px;color:#bbb;text-align:center">DriveHire — On-Demand Driver Hiring Platform</p>
        </div>`
    });
};

module.exports = { sendEmail, sendPasswordResetEmail, sendWelcomeEmail };

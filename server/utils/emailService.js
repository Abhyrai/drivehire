const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendOTP = async (email, otp) => {
    const { error } = await resend.emails.send({
        from: 'DriveHire <onboarding@resend.dev>',
        to: email,
        subject: 'DriveHire - Your Verification Code: ' + otp,
        text: `Your DriveHire verification code is: ${otp}\n\nThis code expires in 10 minutes. Do not share it with anyone.\n\n- DriveHire Team`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #1a1a2e; border-radius: 12px; color: #fff;">
                <h2 style="text-align: center; color: #ff6b35;">DriveHire</h2>
                <p style="text-align: center; font-size: 14px; color: #ccc;">Your email verification code is:</p>
                <div style="text-align: center; margin: 24px 0;">
                    <span style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #ff6b35; background: rgba(255,107,53,0.1); padding: 16px 32px; border-radius: 8px; display: inline-block;">${otp}</span>
                </div>
                <p style="text-align: center; font-size: 12px; color: #888;">This code expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
            </div>
        `
    });
    if (error) throw new Error(error.message);
    console.log('✅ OTP email sent to', email);
};

module.exports = { sendOTP };

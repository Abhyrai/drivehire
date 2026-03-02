const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

// Verify connection on startup
transporter.verify().then(() => {
    console.log('✅ SMTP connection ready');
}).catch(err => {
    console.error('❌ SMTP connection error:', err.message);
});

const sendOTP = async (email, otp) => {
    const mailOptions = {
        from: `"DriveHire" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'DriveHire - Your Verification Code: ' + otp,
        // Plain text version (important for deliverability)
        text: `Your DriveHire verification code is: ${otp}\n\nThis code expires in 10 minutes. Do not share it with anyone.\n\n- DriveHire Team`,
        // HTML version
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
    };
    await transporter.sendMail(mailOptions);
};

module.exports = { sendOTP };

import { useState, useRef, useEffect } from 'react';
import { verifyOTP, resendOTP } from '../services/api';
import { toast } from 'react-toastify';

export default function OTPVerification({ email, onVerified }) {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(60);
    const [error, setError] = useState('');
    const refs = useRef([]);

    useEffect(() => {
        refs.current[0]?.focus();
        const t = setInterval(() => {
            setResendCooldown(prev => prev <= 1 ? (clearInterval(t), 0) : prev - 1);
        }, 1000);
        return () => clearInterval(t);
    }, []);

    // Auto-submit when all 6 digits filled
    useEffect(() => {
        const code = otp.join('');
        if (code.length === 6 && /^\d{6}$/.test(code)) {
            handleVerify(code);
        }
    }, [otp]);

    const handleChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setError('');
        if (value && index < 5) refs.current[index + 1]?.focus();
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            refs.current[index - 1]?.focus();
        }
    };

    // Handle paste — paste 6 digits at once
    const handlePaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (pasted.length === 0) return;
        const newOtp = [...otp];
        for (let i = 0; i < 6; i++) newOtp[i] = pasted[i] || '';
        setOtp(newOtp);
        setError('');
        const focusIdx = Math.min(pasted.length, 5);
        refs.current[focusIdx]?.focus();
    };

    const handleVerify = async (code) => {
        if (!code) code = otp.join('');
        if (code.length !== 6) { setError('Please enter all 6 digits'); return; }
        if (!/^\d{6}$/.test(code)) { setError('Code must be 6 digits'); return; }
        setLoading(true);
        setError('');
        try {
            const { data } = await verifyOTP({ email, otp: code });
            toast.success('Email verified! Welcome! 🎉');
            onVerified(data);
        } catch (err) {
            const msg = err.response?.data?.message || 'Invalid or expired code';
            setError(msg);
            setOtp(['', '', '', '', '', '']);
            refs.current[0]?.focus();
        } finally { setLoading(false); }
    };

    const handleResend = async () => {
        if (resendCooldown > 0) return;
        try {
            await resendOTP({ email });
            toast.info('New code sent! Check your inbox');
            setResendCooldown(60);
            const t = setInterval(() => {
                setResendCooldown(prev => prev <= 1 ? (clearInterval(t), 0) : prev - 1);
            }, 1000);
            setOtp(['', '', '', '', '', '']);
            setError('');
            refs.current[0]?.focus();
        } catch (err) { toast.error(err.response?.data?.message || 'Failed to resend'); }
    };

    return (
        <div className="auth-page">
            <div className="auth-card animate-in" style={{ maxWidth: 420, textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📧</div>
                <h2 style={{ marginBottom: 4 }}>Verify Your Email</h2>
                <p className="text-muted" style={{ marginBottom: 20, fontSize: 'var(--font-sm)' }}>
                    We sent a 6-digit code to<br /><strong style={{ color: 'var(--primary)' }}>{email}</strong>
                </p>

                {error && (
                    <div className="error-message" style={{ marginBottom: 16, fontSize: 'var(--font-sm)' }}>
                        {error}
                    </div>
                )}

                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 20 }}>
                    {otp.map((digit, i) => (
                        <input key={i} ref={el => refs.current[i] = el}
                            type="text" inputMode="numeric" maxLength={1}
                            value={digit}
                            onChange={(e) => handleChange(i, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(i, e)}
                            onPaste={handlePaste}
                            disabled={loading}
                            style={{
                                width: 46, height: 54, textAlign: 'center', fontSize: 22, fontWeight: 700,
                                borderRadius: 'var(--radius-md)',
                                border: `2px solid ${error ? 'var(--danger)' : digit ? 'var(--primary)' : 'var(--border-color)'}`,
                                background: 'var(--bg-secondary)', color: 'var(--text-primary)',
                                outline: 'none', transition: 'border 0.2s',
                                opacity: loading ? 0.5 : 1
                            }}
                            onFocus={(e) => { if (!error) e.target.style.borderColor = 'var(--primary)'; }}
                            onBlur={(e) => { if (!error && !digit) e.target.style.borderColor = 'var(--border-color)'; }}
                        />
                    ))}
                </div>

                <button className="btn btn-primary w-full btn-lg" onClick={() => handleVerify()} disabled={loading || otp.join('').length !== 6}>
                    {loading ? 'Verifying...' : '✅ Verify Email'}
                </button>

                <div style={{ marginTop: 16, fontSize: 'var(--font-sm)', color: 'var(--text-secondary)' }}>
                    <p>
                        Didn't receive?{' '}
                        <button onClick={handleResend} disabled={resendCooldown > 0}
                            style={{
                                background: 'none', border: 'none', padding: 0, fontWeight: 600,
                                color: resendCooldown > 0 ? 'var(--text-muted)' : 'var(--primary)',
                                cursor: resendCooldown > 0 ? 'default' : 'pointer'
                            }}>
                            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                        </button>
                    </p>
                    <p style={{ marginTop: 8, fontSize: '11px', color: 'var(--text-muted)' }}>
                        💡 Check your <strong>Spam/Junk</strong> folder if you don't see it in Inbox
                    </p>
                </div>
            </div>
        </div>
    );
}

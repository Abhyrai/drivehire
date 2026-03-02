import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { loginUser, verifyOTP, resendOTP } from '../../services/api';
import { toast } from 'react-toastify';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

export default function Login() {
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPwd, setShowPwd] = useState(false);
    const [otpStep, setOtpStep] = useState(false);
    const [otpEmail, setOtpEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [otpLoading, setOtpLoading] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const otpRefs = useRef([]);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const startCooldown = () => {
        setResendCooldown(60);
        const t = setInterval(() => {
            setResendCooldown(prev => { if (prev <= 1) { clearInterval(t); return 0; } return prev - 1; });
        }, 1000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const { data } = await loginUser({ ...form, email: form.email.trim().toLowerCase() });
            if (data.needsVerification) {
                setOtpEmail(data.email || form.email.trim().toLowerCase());
                setOtpStep(true);
                startCooldown();
                toast.info('📧 Verification code sent to your email!');
            } else {
                login(data.token, data.user);
                toast.success('Welcome back!');
                if (data.user.role === 'admin') navigate('/admin');
                else if (data.user.role === 'driver') navigate('/driver');
                else navigate('/customer');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        } finally { setLoading(false); }
    };

    const handleOtpChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        if (value && index < 5) otpRefs.current[index + 1]?.focus();
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) otpRefs.current[index - 1]?.focus();
    };

    const handleVerifyOTP = async () => {
        const code = otp.join('');
        if (code.length !== 6) { toast.error('Enter all 6 digits'); return; }
        setOtpLoading(true);
        try {
            const { data } = await verifyOTP({ email: otpEmail, otp: code });
            login(data.token, data.user);
            toast.success('Email verified! Welcome! 🎉');
            if (data.user.role === 'admin') navigate('/admin');
            else if (data.user.role === 'driver') navigate('/driver');
            else navigate('/customer');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Invalid code');
            setOtp(['', '', '', '', '', '']);
            otpRefs.current[0]?.focus();
        } finally { setOtpLoading(false); }
    };

    const handleResend = async () => {
        if (resendCooldown > 0) return;
        try {
            await resendOTP({ email: otpEmail });
            toast.info('New code sent!');
            startCooldown();
            setOtp(['', '', '', '', '', '']);
        } catch (err) { toast.error('Failed to resend'); }
    };

    // OTP Verification Screen
    if (otpStep) {
        return (
            <div className="auth-page">
                <div className="auth-card animate-in" style={{ maxWidth: 400, textAlign: 'center' }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>📧</div>
                    <h2 style={{ marginBottom: 8 }}>Verify Your Email</h2>
                    <p className="text-muted" style={{ marginBottom: 24, fontSize: 'var(--font-sm)' }}>
                        We sent a 6-digit code to <strong>{otpEmail}</strong>
                    </p>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 24 }}>
                        {otp.map((digit, i) => (
                            <input key={i} ref={el => otpRefs.current[i] = el}
                                type="text" inputMode="numeric" maxLength={1}
                                value={digit} onChange={(e) => handleOtpChange(i, e.target.value)}
                                onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                style={{
                                    width: 48, height: 56, textAlign: 'center', fontSize: 24, fontWeight: 700,
                                    borderRadius: 'var(--radius-md)', border: '2px solid var(--border-color)',
                                    background: 'var(--bg-secondary)', color: 'var(--text-primary)',
                                    outline: 'none', transition: 'border 0.2s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                            />
                        ))}
                    </div>
                    <button className="btn btn-primary w-full btn-lg" onClick={handleVerifyOTP} disabled={otpLoading}>
                        {otpLoading ? 'Verifying...' : '✅ Verify Email'}
                    </button>
                    <p style={{ marginTop: 16, fontSize: 'var(--font-sm)', color: 'var(--text-secondary)' }}>
                        Didn't receive? {' '}
                        <button onClick={handleResend} disabled={resendCooldown > 0}
                            style={{ background: 'none', border: 'none', color: resendCooldown > 0 ? 'var(--text-muted)' : 'var(--primary)', cursor: resendCooldown > 0 ? 'default' : 'pointer', fontWeight: 600, padding: 0 }}>
                            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                        </button>
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-page">
            <div className="auth-card animate-in">
                <div className="auth-header">
                    <div className="logo-text">🚗 DriveHire</div>
                    <p>Sign in to your account</p>
                </div>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <div className="input-icon-wrapper">
                            <FiMail className="input-icon" />
                            <input type="email" name="email" className="form-input has-icon" placeholder="you@example.com"
                                value={form.email} onChange={handleChange} required autoComplete="email" />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <div className="input-icon-wrapper">
                            <FiLock className="input-icon" />
                            <input type={showPwd ? 'text' : 'password'} name="password" className="form-input has-icon"
                                placeholder="••••••••" value={form.password} onChange={handleChange} required autoComplete="current-password" />
                            <button type="button" className="input-toggle" onClick={() => setShowPwd(!showPwd)}>
                                {showPwd ? <FiEyeOff /> : <FiEye />}
                            </button>
                        </div>
                    </div>
                    <div style={{ textAlign: 'right', marginBottom: '1rem' }}>
                        <Link to="/forgot-password" style={{ fontSize: 'var(--font-sm)', color: 'var(--primary)' }}>Forgot password?</Link>
                    </div>
                    <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading}>
                        {loading ? 'Signing In...' : '🔐 Sign In'}
                    </button>
                </form>

                <div className="auth-divider"><span>or</span></div>

                <div className="auth-footer">
                    Don't have an account? <Link to="/register">Sign Up</Link>
                </div>
            </div>
        </div>
    );
}

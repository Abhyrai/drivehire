import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { resetPassword } from '../../services/api';
import { toast } from 'react-toastify';
import { FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPwd, setShowPwd] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) return toast.error('Passwords do not match');
        if (password.length < 6) return toast.error('Password must be at least 6 characters');

        setLoading(true);
        try {
            const { data } = await resetPassword({ token, password });
            if (data.token) localStorage.setItem('token', data.token);
            toast.success('Password reset successful! 🎉');
            navigate('/login');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Invalid or expired reset link');
        } finally { setLoading(false); }
    };

    if (!token) {
        return (
            <div className="auth-page">
                <div className="auth-card animate-in">
                    <div className="auth-header">
                        <div className="logo-text">🚗 DriveHire</div>
                    </div>
                    <div className="text-center" style={{ padding: '2rem 0' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
                        <h3>Invalid Reset Link</h3>
                        <p className="text-muted" style={{ marginTop: '0.5rem', fontSize: 'var(--font-sm)' }}>
                            This password reset link is invalid or has expired.
                        </p>
                        <Link to="/forgot-password" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
                            Request New Link
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-page">
            <div className="auth-card animate-in">
                <div className="auth-header">
                    <div className="logo-text">🚗 DriveHire</div>
                    <p>Set your new password</p>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">New Password</label>
                        <div className="input-icon-wrapper">
                            <FiLock className="input-icon" />
                            <input type={showPwd ? 'text' : 'password'} className="form-input has-icon"
                                placeholder="Min 6 characters" value={password}
                                onChange={e => setPassword(e.target.value)} required minLength={6} />
                            <button type="button" className="input-toggle" onClick={() => setShowPwd(!showPwd)}>
                                {showPwd ? <FiEyeOff /> : <FiEye />}
                            </button>
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Confirm New Password</label>
                        <input type={showPwd ? 'text' : 'password'} className="form-input"
                            placeholder="Re-enter password" value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)} required minLength={6} />
                        {confirmPassword && password !== confirmPassword && (
                            <span style={{ fontSize: '11px', color: 'var(--danger)', fontWeight: 600 }}>Passwords don't match</span>
                        )}
                    </div>
                    <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                        {loading ? 'Resetting...' : '🔒 Reset Password'}
                    </button>
                </form>
                <div className="auth-footer">
                    <Link to="/login">← Back to Login</Link>
                </div>
            </div>
        </div>
    );
}

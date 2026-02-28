import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../../services/api';
import { toast } from 'react-toastify';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await forgotPassword({ email });
            setSent(true);
            toast.success('Reset instructions sent!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card animate-in">
                <div className="auth-header">
                    <div className="logo-text">🚗 DriveHire</div>
                    <p>Reset your password</p>
                </div>
                {sent ? (
                    <div className="text-center" style={{ padding: '2rem 0' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📧</div>
                        <h3>Check your email</h3>
                        <p className="text-muted" style={{ marginTop: '0.5rem', fontSize: 'var(--font-sm)' }}>
                            We've sent password reset instructions to <strong>{email}</strong>
                        </p>
                        <Link to="/login" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>Back to Login</Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input type="email" className="form-input" placeholder="you@example.com"
                                value={email} onChange={(e) => setEmail(e.target.value)} required />
                        </div>
                        <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </button>
                    </form>
                )}
                <div className="auth-footer">
                    <Link to="/login">← Back to Login</Link>
                </div>
            </div>
        </div>
    );
}

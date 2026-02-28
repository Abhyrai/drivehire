import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { loginUser } from '../../services/api';
import { toast } from 'react-toastify';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

export default function Login() {
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPwd, setShowPwd] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const { data } = await loginUser({ ...form, email: form.email.trim().toLowerCase() });
            login(data.token, data.user);
            toast.success('Welcome back!');
            if (data.user.role === 'admin') navigate('/admin');
            else if (data.user.role === 'driver') navigate('/driver');
            else navigate('/customer');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

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

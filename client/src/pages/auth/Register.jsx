import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { registerUser } from '../../services/api';
import { toast } from 'react-toastify';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiPhone, FiMapPin } from 'react-icons/fi';
import { validatePhone, getPasswordStrength } from '../../utils/utils';

export default function Register() {
    const [role, setRole] = useState('customer');
    const [form, setForm] = useState({
        name: '', email: '', password: '', confirmPassword: '', phone: '', city: '',
        licenseNumber: '', experience: '', vehicleTypes: 'car', transmissions: 'manual', languages: 'English'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPwd, setShowPwd] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const strength = getPasswordStrength(form.password);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validations
        if (form.name.trim().length < 2) { setError('Name must be at least 2 characters'); return; }
        if (!validatePhone(form.phone)) { setError('Enter a valid 10-digit Indian phone number'); return; }
        if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
        if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
        if (!form.city.trim()) { setError('City is required'); return; }
        if (role === 'driver') {
            if (!form.licenseNumber.trim() || form.licenseNumber.trim().length < 5) {
                setError('Enter a valid license number'); return;
            }
            if (!form.experience || Number(form.experience) < 0) {
                setError('Enter valid experience'); return;
            }
        }

        setLoading(true);
        try {
            const payload = {
                name: form.name.trim(), email: form.email.trim().toLowerCase(),
                password: form.password, phone: form.phone.trim(), city: form.city.trim(), role
            };
            if (role === 'driver') {
                payload.licenseNumber = form.licenseNumber.trim();
                payload.experience = Number(form.experience);
                payload.vehicleTypes = [form.vehicleTypes];
                payload.transmissions = [form.transmissions];
                payload.languages = form.languages.split(',').map(l => l.trim()).filter(Boolean);
            }
            const { data } = await registerUser(payload);
            login(data.token, data.user);
            toast.success('Account created! 🎉');
            if (role === 'driver') navigate('/driver');
            else navigate('/customer');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card animate-in" style={{ maxWidth: role === 'driver' ? 540 : 460 }}>
                <div className="auth-header">
                    <div className="logo-text">🚗 DriveHire</div>
                    <p>Create your account</p>
                </div>

                <div className="role-toggle">
                    <button className={role === 'customer' ? 'active' : ''} onClick={() => setRole('customer')}>
                        👤 Customer
                    </button>
                    <button className={role === 'driver' ? 'active' : ''} onClick={() => setRole('driver')}>
                        🚗 Driver
                    </button>
                </div>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <div className="input-icon-wrapper">
                                <FiUser className="input-icon" />
                                <input name="name" className="form-input has-icon" placeholder="John Doe"
                                    value={form.name} onChange={handleChange} required minLength={2} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Phone (10 digits)</label>
                            <div className="input-icon-wrapper">
                                <FiPhone className="input-icon" />
                                <input name="phone" className="form-input has-icon" placeholder="9876543210"
                                    value={form.phone} onChange={handleChange} required pattern="\d{10}"
                                    maxLength={10} inputMode="numeric" />
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <div className="input-icon-wrapper">
                            <FiMail className="input-icon" />
                            <input type="email" name="email" className="form-input has-icon" placeholder="you@example.com"
                                value={form.email} onChange={handleChange} required autoComplete="email" />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Password (min 6)</label>
                            <div className="input-icon-wrapper">
                                <FiLock className="input-icon" />
                                <input type={showPwd ? 'text' : 'password'} name="password" className="form-input has-icon"
                                    placeholder="••••••••" value={form.password} onChange={handleChange} required minLength={6} />
                                <button type="button" className="input-toggle" onClick={() => setShowPwd(!showPwd)}>
                                    {showPwd ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </div>
                            {form.password && (
                                <div style={{ marginTop: 6 }}>
                                    <div style={{ display: 'flex', gap: 3 }}>
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <div key={i} style={{
                                                flex: 1, height: 3, borderRadius: 2,
                                                background: i <= strength.score ? strength.color : 'var(--border-color)',
                                                transition: 'background 0.3s'
                                            }} />
                                        ))}
                                    </div>
                                    <span style={{ fontSize: '11px', color: strength.color, fontWeight: 600 }}>{strength.label}</span>
                                </div>
                            )}
                        </div>
                        <div className="form-group">
                            <label className="form-label">Confirm Password</label>
                            <div className="input-icon-wrapper">
                                <FiLock className="input-icon" />
                                <input type={showPwd ? 'text' : 'password'} name="confirmPassword" className="form-input has-icon"
                                    placeholder="••••••••" value={form.confirmPassword} onChange={handleChange} required minLength={6} />
                            </div>
                            {form.confirmPassword && form.password !== form.confirmPassword && (
                                <span style={{ fontSize: '11px', color: 'var(--danger)', fontWeight: 600 }}>Passwords don't match</span>
                            )}
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">City</label>
                        <div className="input-icon-wrapper">
                            <FiMapPin className="input-icon" />
                            <input name="city" className="form-input has-icon" placeholder="Mumbai"
                                value={form.city} onChange={handleChange} required />
                        </div>
                    </div>

                    {role === 'driver' && (
                        <>
                            <div className="auth-divider"><span>Driver Details</span></div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">License Number</label>
                                    <input name="licenseNumber" className="form-input" placeholder="DL-0420110012345"
                                        value={form.licenseNumber} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Experience (years)</label>
                                    <input type="number" name="experience" className="form-input" placeholder="3"
                                        min="0" max="50" value={form.experience} onChange={handleChange} required />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Vehicle Type</label>
                                    <select name="vehicleTypes" className="form-select" value={form.vehicleTypes} onChange={handleChange}>
                                        <option value="car">Car</option>
                                        <option value="bike">Bike</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Transmission</label>
                                    <select name="transmissions" className="form-select" value={form.transmissions} onChange={handleChange}>
                                        <option value="manual">Manual</option>
                                        <option value="automatic">Automatic</option>
                                        <option value="both">Both</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Languages (comma separated)</label>
                                <input name="languages" className="form-input" placeholder="English, Hindi"
                                    value={form.languages} onChange={handleChange} />
                            </div>
                        </>
                    )}

                    <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading} style={{ marginTop: '0.5rem' }}>
                        {loading ? 'Creating Account...' : `🚀 Sign Up as ${role === 'driver' ? 'Driver' : 'Customer'}`}
                    </button>
                </form>

                <div className="auth-divider"><span>or</span></div>

                <div className="auth-footer">
                    Already have an account? <Link to="/login">Sign In</Link>
                </div>
            </div>
        </div>
    );
}

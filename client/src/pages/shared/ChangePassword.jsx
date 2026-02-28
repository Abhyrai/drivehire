import { useState } from 'react';
import { changePassword } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { FiLock, FiEye, FiEyeOff, FiShield } from 'react-icons/fi';
import { getPasswordStrength } from '../../utils/utils';

export default function ChangePassword() {
    const { login: updateToken } = useAuth();
    const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [show, setShow] = useState({ current: false, new: false, confirm: false });
    const [loading, setLoading] = useState(false);

    const strength = getPasswordStrength(form.newPassword);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (form.newPassword !== form.confirmPassword) {
            return toast.error('New passwords do not match');
        }
        if (form.newPassword.length < 6) {
            return toast.error('Password must be at least 6 characters');
        }
        if (form.currentPassword === form.newPassword) {
            return toast.error('New password must be different from current');
        }

        setLoading(true);
        try {
            const { data } = await changePassword({
                currentPassword: form.currentPassword,
                newPassword: form.newPassword
            });
            if (data.token) {
                localStorage.setItem('token', data.token);
            }
            toast.success('Password changed successfully! 🔒');
            setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    const PasswordInput = ({ label, name, value, showPwd, toggleKey }) => (
        <div style={{ position: 'relative', marginBottom: 16 }}>
            <label className="form-label">{label}</label>
            <div style={{ position: 'relative' }}>
                <input
                    className="form-input"
                    type={showPwd ? 'text' : 'password'}
                    value={value}
                    onChange={e => setForm(prev => ({ ...prev, [name]: e.target.value }))}
                    required
                    minLength={name === 'currentPassword' ? 1 : 6}
                    placeholder={`Enter ${label.toLowerCase()}`}
                    style={{ paddingRight: 44 }}
                />
                <button
                    type="button"
                    onClick={() => setShow(prev => ({ ...prev, [toggleKey]: !prev[toggleKey] }))}
                    style={{
                        position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--text-muted)', fontSize: '1.1rem'
                    }}
                >
                    {showPwd ? <FiEyeOff /> : <FiEye />}
                </button>
            </div>
        </div>
    );

    return (
        <div className="page-content">
            <div className="page-header">
                <h1><FiShield style={{ marginRight: 10 }} /> Change Password</h1>
                <p className="text-muted">Update your account password</p>
            </div>

            <div className="card" style={{ maxWidth: 500 }}>
                <form onSubmit={handleSubmit}>
                    <PasswordInput
                        label="Current Password" name="currentPassword"
                        value={form.currentPassword} showPwd={show.current} toggleKey="current"
                    />
                    <PasswordInput
                        label="New Password" name="newPassword"
                        value={form.newPassword} showPwd={show.new} toggleKey="new"
                    />

                    {form.newPassword && (
                        <div style={{ marginBottom: 16 }}>
                            <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} style={{
                                        flex: 1, height: 4, borderRadius: 2,
                                        background: i <= strength.score ? strength.color : 'var(--border-color)',
                                        transition: 'background 0.3s ease'
                                    }} />
                                ))}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: 'var(--font-xs)', color: strength.color, fontWeight: 600 }}>
                                    {strength.label}
                                </span>
                                <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
                                    {form.newPassword.length < 6 ? `${6 - form.newPassword.length} more chars needed` : ''}
                                </span>
                            </div>
                        </div>
                    )}

                    <PasswordInput
                        label="Confirm New Password" name="confirmPassword"
                        value={form.confirmPassword} showPwd={show.confirm} toggleKey="confirm"
                    />

                    <button className="btn btn-primary" type="submit" disabled={loading}
                        style={{ width: '100%', marginTop: 8 }}>
                        {loading ? 'Changing...' : '🔒 Change Password'}
                    </button>
                </form>
            </div>
        </div>
    );
}

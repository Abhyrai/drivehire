import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { changePassword } from '../../services/api';
import { toast } from 'react-toastify';
import { FiSettings, FiLock, FiSun, FiMoon, FiBell, FiShield, FiEye, FiEyeOff, FiTrash2 } from 'react-icons/fi';
import { getPasswordStrength } from '../../utils/utils';

export default function Settings() {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();

    // Password form
    const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [showPwd, setShowPwd] = useState(false);
    const [pwdLoading, setPwdLoading] = useState(false);

    // Notification prefs (UI only)
    const [notifPrefs, setNotifPrefs] = useState({
        emailBooking: true, emailPromo: false, pushAlerts: true
    });

    const strength = getPasswordStrength(pwdForm.newPassword);

    const handlePwdChange = (e) => setPwdForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (pwdForm.newPassword !== pwdForm.confirmPassword) {
            return toast.error('Passwords do not match');
        }
        if (pwdForm.newPassword.length < 6) {
            return toast.error('Password must be at least 6 characters');
        }
        if (pwdForm.currentPassword === pwdForm.newPassword) {
            return toast.error('New password must be different');
        }
        setPwdLoading(true);
        try {
            const { data } = await changePassword({
                currentPassword: pwdForm.currentPassword,
                newPassword: pwdForm.newPassword
            });
            if (data.token) localStorage.setItem('token', data.token);
            toast.success('Password changed! 🔒');
            setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to change password');
        } finally { setPwdLoading(false); }
    };

    const handleDeleteAccount = () => {
        if (window.confirm('Are you sure you want to delete your account? This cannot be undone.')) {
            toast.info('Contact support@drivehire.in to delete your account');
        }
    };

    const SettingSection = ({ icon, title, children }) => (
        <div className="glass-card" style={{ marginBottom: 'var(--space-lg)' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'var(--space-lg)', fontFamily: 'var(--font-heading)' }}>
                {icon} {title}
            </h3>
            {children}
        </div>
    );

    const ToggleRow = ({ label, desc, checked, onChange }) => (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border-color)' }}>
            <div>
                <div style={{ fontWeight: 600, fontSize: 'var(--font-sm)' }}>{label}</div>
                {desc && <div className="text-sm text-muted">{desc}</div>}
            </div>
            <label className="toggle">
                <input type="checkbox" checked={checked} onChange={onChange} />
                <span className="slider"></span>
            </label>
        </div>
    );

    return (
        <div className="page-content">
            <div className="page-header">
                <h1><FiSettings style={{ marginRight: 8 }} /> Settings</h1>
                <p className="text-muted">Manage your account preferences</p>
            </div>

            <div style={{ maxWidth: 600 }}>

                {/* Appearance */}
                <SettingSection icon={<FiSun />} title="Appearance">
                    <ToggleRow
                        label="Dark Mode"
                        desc="Switch between light and dark themes"
                        checked={theme === 'dark'}
                        onChange={toggleTheme}
                    />
                </SettingSection>

                {/* Notifications */}
                <SettingSection icon={<FiBell />} title="Notifications">
                    <ToggleRow
                        label="Booking Updates"
                        desc="Email me about booking status changes"
                        checked={notifPrefs.emailBooking}
                        onChange={() => setNotifPrefs(p => ({ ...p, emailBooking: !p.emailBooking }))}
                    />
                    <ToggleRow
                        label="Promotional Emails"
                        desc="Receive offers and new features"
                        checked={notifPrefs.emailPromo}
                        onChange={() => setNotifPrefs(p => ({ ...p, emailPromo: !p.emailPromo }))}
                    />
                    <ToggleRow
                        label="Push Notifications"
                        desc="Browser alerts for urgent updates"
                        checked={notifPrefs.pushAlerts}
                        onChange={() => setNotifPrefs(p => ({ ...p, pushAlerts: !p.pushAlerts }))}
                    />
                </SettingSection>

                {/* Change Password */}
                <SettingSection icon={<FiLock />} title="Change Password">
                    <form onSubmit={handlePasswordSubmit}>
                        <div className="form-group">
                            <label className="form-label">Current Password</label>
                            <div className="input-icon-wrapper">
                                <FiLock className="input-icon" />
                                <input type={showPwd ? 'text' : 'password'} name="currentPassword"
                                    className="form-input has-icon" placeholder="Enter current password"
                                    value={pwdForm.currentPassword} onChange={handlePwdChange} required />
                                <button type="button" className="input-toggle" onClick={() => setShowPwd(!showPwd)}>
                                    {showPwd ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">New Password</label>
                            <input type={showPwd ? 'text' : 'password'} name="newPassword"
                                className="form-input" placeholder="Min 6 characters"
                                value={pwdForm.newPassword} onChange={handlePwdChange} required minLength={6} />
                            {pwdForm.newPassword && (
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
                            <label className="form-label">Confirm New Password</label>
                            <input type={showPwd ? 'text' : 'password'} name="confirmPassword"
                                className="form-input" placeholder="Re-enter new password"
                                value={pwdForm.confirmPassword} onChange={handlePwdChange} required minLength={6} />
                            {pwdForm.confirmPassword && pwdForm.newPassword !== pwdForm.confirmPassword && (
                                <span style={{ fontSize: '11px', color: 'var(--danger)', fontWeight: 600 }}>Passwords don't match</span>
                            )}
                        </div>
                        <button className="btn btn-primary" type="submit" disabled={pwdLoading} style={{ marginTop: 4 }}>
                            {pwdLoading ? 'Changing...' : '🔒 Update Password'}
                        </button>
                    </form>
                </SettingSection>

                {/* Account / Danger Zone */}
                <SettingSection icon={<FiShield />} title="Account">
                    <div style={{ padding: '12px 0' }}>
                        <div style={{ fontSize: 'var(--font-sm)' }}>
                            <strong>Email:</strong> {user?.email}
                        </div>
                        <div style={{ fontSize: 'var(--font-sm)', marginTop: 4 }}>
                            <strong>Role:</strong> <span className="badge badge-primary" style={{ textTransform: 'capitalize' }}>{user?.role}</span>
                        </div>
                    </div>
                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 'var(--space-md)', marginTop: 'var(--space-sm)' }}>
                        <button className="btn btn-danger btn-sm" onClick={handleDeleteAccount}
                            style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <FiTrash2 /> Delete Account
                        </button>
                        <p className="text-sm text-muted" style={{ marginTop: 6 }}>This will permanently remove your account and all data.</p>
                    </div>
                </SettingSection>
            </div>
        </div>
    );
}

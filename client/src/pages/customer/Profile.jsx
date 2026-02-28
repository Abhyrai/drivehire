import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updateProfile, getCustomerBookings, getInvoices } from '../../services/api';
import { toast } from 'react-toastify';
import { FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiDollarSign, FiShield, FiEdit3 } from 'react-icons/fi';

export default function CustomerProfile() {
    const { user, setUser } = useAuth();
    const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', city: user?.city || '' });
    const [loading, setLoading] = useState(false);
    const [editing, setEditing] = useState(false);
    const [stats, setStats] = useState({ totalBookings: 0, activeBookings: 0, totalSpent: 0 });

    useEffect(() => {
        Promise.all([getCustomerBookings(), getInvoices()])
            .then(([bookRes, invRes]) => {
                const bookings = bookRes.data.bookings || [];
                const payments = invRes.data.payments || [];
                setStats({
                    totalBookings: bookings.length,
                    activeBookings: bookings.filter(b => ['confirmed', 'active'].includes(b.status)).length,
                    totalSpent: payments.reduce((s, p) => s + (p.status === 'completed' ? p.amount : 0), 0)
                });
            }).catch(() => { });
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await updateProfile(form);
            setUser({ ...user, ...data.user });
            toast.success('Profile updated! ✅');
            setEditing(false);
        } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
        finally { setLoading(false); }
    };

    const memberSince = user?.createdAt
        ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
        : 'Recently';

    return (
        <div className="page-content">
            <div className="page-header">
                <h1><FiUser style={{ marginRight: 10 }} /> My Profile</h1>
                <p className="text-muted">Manage your account information</p>
            </div>

            {/* Account Stats */}
            <div className="stats-grid" style={{ marginBottom: 'var(--space-2xl)' }}>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(108, 92, 231, 0.2)', color: 'var(--primary)' }}><FiCalendar /></div>
                    <div className="stat-info"><h3>{stats.totalBookings}</h3><p>Total Bookings</p></div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(0, 206, 158, 0.2)', color: 'var(--success)' }}><FiShield /></div>
                    <div className="stat-info"><h3>{stats.activeBookings}</h3><p>Active Bookings</p></div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(253, 203, 110, 0.2)', color: 'var(--warning)' }}><FiDollarSign /></div>
                    <div className="stat-info"><h3>₹{stats.totalSpent.toLocaleString()}</h3><p>Total Spent</p></div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-xl)', maxWidth: 800 }}>
                {/* Profile Card */}
                <div className="glass-card">
                    <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
                        <div className="driver-avatar" style={{ width: 90, height: 90, fontSize: 'var(--font-2xl)', margin: '0 auto', background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}>
                            {user?.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <h3 style={{ marginTop: 'var(--space-md)' }}>{user?.name}</h3>
                        <p className="text-sm text-muted" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                            <FiMail size={14} /> {user?.email}
                        </p>
                        <span className="badge badge-primary" style={{ marginTop: 8 }}>Customer</span>
                    </div>

                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: 'var(--space-md)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, color: 'var(--text-secondary)' }}>
                            <FiPhone size={14} /> <span>{user?.phone || 'Not set'}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, color: 'var(--text-secondary)' }}>
                            <FiMapPin size={14} /> <span>{user?.city || 'Not set'}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: 'var(--font-xs)' }}>
                            <FiCalendar size={14} /> Member since {memberSince}
                        </div>
                    </div>
                </div>

                {/* Edit Form */}
                <div className="glass-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
                        <h3><FiEdit3 style={{ marginRight: 8 }} /> Edit Profile</h3>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Phone Number</label>
                            <input className="form-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required placeholder="+91 XXXXX XXXXX" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">City</label>
                            <input className="form-input" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} placeholder="e.g. Mumbai" />
                        </div>
                        <div className="form-group" style={{ opacity: 0.6 }}>
                            <label className="form-label">Email (cannot be changed)</label>
                            <input className="form-input" value={user?.email || ''} disabled />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                            {loading ? 'Saving...' : '✅ Save Changes'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

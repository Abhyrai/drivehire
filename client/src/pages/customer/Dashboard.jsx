import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getCustomerBookings, getVehicles } from '../../services/api';
import { FiCalendar, FiTruck, FiSearch, FiClock } from 'react-icons/fi';
import { formatINR, timeAgo } from '../../utils/utils';
import { StatSkeleton, CardSkeleton } from '../../components/SkeletonLoader';

export default function CustomerDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [recentBookings, setRecentBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const [bRes, vRes] = await Promise.all([getCustomerBookings(), getVehicles()]);
                const bookings = bRes.data.bookings;
                setStats({
                    bookings: bookings.length,
                    vehicles: vRes.data.vehicles.length,
                    active: bookings.filter(b => ['pending', 'confirmed', 'active'].includes(b.status)).length,
                    completed: bookings.filter(b => b.status === 'completed').length
                });
                setRecentBookings(bookings.slice(0, 5));
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        load();
    }, []);

    const statusColor = (s) => ({ pending: 'warning', confirmed: 'info', active: 'success', completed: 'primary', cancelled: 'danger' }[s] || 'primary');

    return (
        <div>
            <div className="page-header">
                <h1>Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
                <p>Here's an overview of your activity</p>
            </div>

            {loading ? <StatSkeleton count={4} /> : stats && (
                <div className="stats-grid">
                    {[
                        { icon: <FiCalendar />, label: 'Total Bookings', value: stats.bookings, color: 'var(--primary)' },
                        { icon: <FiClock />, label: 'Active Bookings', value: stats.active, color: 'var(--accent)' },
                        { icon: <FiTruck />, label: 'My Vehicles', value: stats.vehicles, color: 'var(--success)' },
                        { icon: <FiSearch />, label: 'Completed Trips', value: stats.completed, color: 'var(--info)' }
                    ].map((s, i) => (
                        <div key={i} className="stat-card">
                            <div className="stat-icon" style={{ background: `${s.color}22`, color: s.color }}>{s.icon}</div>
                            <div className="stat-info">
                                <h3>{s.value}</h3>
                                <p>{s.label}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-2xl)', flexWrap: 'wrap' }}>
                <button className="btn btn-primary" onClick={() => navigate('/customer/search')}>🔍 Find a Driver</button>
                <button className="btn btn-secondary" onClick={() => navigate('/customer/vehicles')}>🚗 Add Vehicle</button>
                <button className="btn btn-secondary" onClick={() => navigate('/customer/bookings')}>📋 My Bookings</button>
            </div>

            <div className="glass-card">
                <h3 style={{ marginBottom: 'var(--space-lg)' }}>Recent Bookings</h3>
                {loading ? <CardSkeleton count={3} /> : recentBookings.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📋</div>
                        <h3>No bookings yet</h3>
                        <p>Search for a driver to make your first booking!</p>
                    </div>
                ) : (
                    recentBookings.map((b) => (
                        <div key={b._id} className="booking-card" style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <div className={`booking-status-dot ${b.status}`}></div>
                            <div className="booking-info">
                                <h4>{b.pickupLocation}</h4>
                                <p>{b.durationType} • {new Date(b.startTime).toLocaleDateString()}</p>
                                <span className="text-sm text-muted">{timeAgo(b.createdAt)}</span>
                            </div>
                            <span className={`badge badge-${statusColor(b.status)}`}>{b.status}</span>
                            <div className="booking-amount">{formatINR(b.totalPrice)}</div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getCustomerBookings, getVehicles } from '../../services/api';
import { FiCalendar, FiTruck, FiSearch, FiClock, FiArrowRight, FiCheckCircle, FiStar } from 'react-icons/fi';
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
        <div className="page-content">
            <div className="page-header">
                <h1>Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
                <p>Here's an overview of your activity</p>
            </div>

            {/* Stats */}
            {loading ? <StatSkeleton count={4} /> : stats && (
                <div className="stats-grid">
                    {[
                        { icon: <FiCalendar />, label: 'Total Bookings', value: stats.bookings, color: 'var(--primary)' },
                        { icon: <FiClock />, label: 'Active Bookings', value: stats.active, color: 'var(--accent)' },
                        { icon: <FiTruck />, label: 'My Vehicles', value: stats.vehicles, color: 'var(--success)' },
                        { icon: <FiCheckCircle />, label: 'Completed', value: stats.completed, color: 'var(--info)' }
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

            {/* Quick Actions — Full-width cards */}
            <div className="section-header">
                <h3>Quick Actions</h3>
            </div>
            <div className="action-cards">
                <div className="action-card action-card-primary" onClick={() => navigate('/customer/search')}>
                    <div className="action-card-icon"><FiSearch size={24} /></div>
                    <div className="action-card-content">
                        <h4>Find a Driver</h4>
                        <p>Browse verified drivers near you</p>
                    </div>
                    <FiArrowRight className="action-card-arrow" />
                </div>
                <div className="action-card" onClick={() => navigate('/customer/vehicles')}>
                    <div className="action-card-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)' }}><FiTruck size={24} /></div>
                    <div className="action-card-content">
                        <h4>My Vehicles</h4>
                        <p>Add or manage your vehicles</p>
                    </div>
                    <FiArrowRight className="action-card-arrow" />
                </div>
                <div className="action-card" onClick={() => navigate('/customer/bookings')}>
                    <div className="action-card-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: 'var(--info)' }}><FiCalendar size={24} /></div>
                    <div className="action-card-content">
                        <h4>My Bookings</h4>
                        <p>View booking history & status</p>
                    </div>
                    <FiArrowRight className="action-card-arrow" />
                </div>
            </div>

            {/* Recent Bookings */}
            <div className="section-header" style={{ marginTop: 'var(--space-xl)' }}>
                <h3>Recent Activity</h3>
                {recentBookings.length > 0 && (
                    <button className="btn btn-sm btn-secondary" onClick={() => navigate('/customer/bookings')}>View All</button>
                )}
            </div>

            {loading ? <CardSkeleton count={3} /> : recentBookings.length === 0 ? (
                <div className="glass-card empty-state">
                    <div className="empty-icon">📋</div>
                    <h3>No bookings yet</h3>
                    <p>Search for a driver to make your first booking!</p>
                    <button className="btn btn-primary" onClick={() => navigate('/customer/search')} style={{ marginTop: 'var(--space-md)' }}>
                        Find a Driver
                    </button>
                </div>
            ) : (
                <div className="booking-cards-list">
                    {recentBookings.map((b) => (
                        <div key={b._id} className="booking-card-full" onClick={() => navigate('/customer/bookings')}>
                            <div className="booking-card-header">
                                <div className={`booking-status-dot ${b.status}`}></div>
                                <span className={`badge badge-${statusColor(b.status)}`}>{b.status}</span>
                                <span className="booking-amount">{formatINR(b.totalPrice)}</span>
                            </div>
                            <div className="booking-card-body">
                                <h4>{b.pickupLocation}</h4>
                                <div className="booking-card-meta">
                                    <span><FiCalendar size={12} /> {new Date(b.startTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                                    <span><FiClock size={12} /> {b.durationType}</span>
                                    {b.vehicleId && <span><FiTruck size={12} /> {b.vehicleId.make} {b.vehicleId.model}</span>}
                                </div>
                            </div>
                            <div className="booking-card-footer">
                                <span className="text-sm text-muted">{timeAgo(b.createdAt)}</span>
                                <FiArrowRight size={14} className="text-muted" />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

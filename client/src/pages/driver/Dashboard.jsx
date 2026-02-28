import { useState, useEffect } from 'react';
import { getDriverProfile, getDriverJobs, toggleOnline } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { FiBriefcase, FiDollarSign, FiStar, FiCheckCircle, FiClock, FiShield } from 'react-icons/fi';
import { toast } from 'react-toastify';
import MapView from '../../components/MapView';
import { formatINR } from '../../utils/utils';
import { PageSkeleton } from '../../components/SkeletonLoader';

const cityCoords = {
    mumbai: [19.076, 72.8777], delhi: [28.6139, 77.209], bangalore: [12.9716, 77.5946],
    hyderabad: [17.385, 78.4867], chennai: [13.0827, 80.2707], kolkata: [22.5726, 88.3639],
    pune: [18.5204, 73.8567], ahmedabad: [23.0225, 72.5714], jaipur: [26.9124, 75.7873],
};

export default function DriverDashboard() {
    const navigate = useNavigate();
    const [driver, setDriver] = useState(null);
    const [pendingJobs, setPendingJobs] = useState([]);
    const [activeJobs, setActiveJobs] = useState([]);

    useEffect(() => {
        const load = async () => {
            try {
                const [dRes, pRes, aRes] = await Promise.all([
                    getDriverProfile(),
                    getDriverJobs({ status: 'pending' }),
                    getDriverJobs({ status: 'active' })
                ]);
                setDriver(dRes.data.driver);
                setPendingJobs(pRes.data.bookings);
                setActiveJobs(aRes.data.bookings);
            } catch (err) { console.error(err); }
        };
        load();
    }, []);

    const handleToggle = async () => {
        try {
            const { data } = await toggleOnline();
            setDriver(prev => ({ ...prev, isOnline: data.isOnline }));
            toast.success(data.isOnline ? 'You are now online!' : 'You are now offline');
        } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    };

    if (!driver) return <PageSkeleton />;

    const docStatus = driver.documentStatus || 'not_submitted';
    const docColors = { verified: 'badge-success', pending: 'badge-warning', rejected: 'badge-danger', not_submitted: 'badge-secondary' };
    const docLabels = { verified: '✅ Documents Verified', pending: '⏳ Documents Under Review', rejected: '❌ Documents Rejected', not_submitted: '📄 Documents Not Submitted' };

    return (
        <div className="page-content">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div>
                    <h1>Driver Dashboard 🚗</h1>
                    <p>Welcome back, {driver.userId?.name}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                    <span className={`badge ${driver.isOnline ? 'badge-success' : 'badge-danger'}`}>
                        {driver.isOnline ? '🟢 Online' : '🔴 Offline'}
                    </span>
                    <label className="toggle">
                        <input type="checkbox" checked={driver.isOnline} onChange={handleToggle} />
                        <span className="slider"></span>
                    </label>
                </div>
            </div>

            {/* Alerts */}
            {driver.isApproved === 'pending' && (
                <div className="error-message" style={{ background: 'rgba(253, 203, 110, 0.15)', borderColor: 'rgba(253, 203, 110, 0.3)', color: 'var(--warning)', marginBottom: 'var(--space-xl)' }}>
                    ⏳ Your profile is pending admin approval. You cannot accept jobs yet.
                </div>
            )}
            {driver.isApproved === 'rejected' && (
                <div className="error-message" style={{ marginBottom: 'var(--space-xl)' }}>
                    ❌ Your profile was rejected. Please update your documents and contact admin.
                </div>
            )}

            {/* Stats */}
            <div className="stats-grid">
                {[
                    { icon: <FiBriefcase />, label: 'Completed Jobs', value: driver.completedJobs, color: 'var(--primary)' },
                    { icon: <FiDollarSign />, label: 'Total Earnings', value: formatINR(driver.totalEarnings || 0), color: 'var(--accent)' },
                    { icon: <FiStar />, label: 'Rating', value: driver.rating ? Number(driver.rating).toFixed(1) : 'New', color: 'var(--warning)' },
                    { icon: <FiCheckCircle />, label: 'Pending Requests', value: pendingJobs.length, color: 'var(--info)' },
                    { icon: <FiClock />, label: 'Active Jobs', value: activeJobs.length, color: 'var(--success)' }
                ].map((s, i) => (
                    <div key={i} className="stat-card">
                        <div className="stat-icon" style={{ background: `${s.color}22`, color: s.color }}>{s.icon}</div>
                        <div className="stat-info"><h3>{s.value}</h3><p>{s.label}</p></div>
                    </div>
                ))}
            </div>

            {/* Document & Availability Status */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)', marginTop: 'var(--space-xl)' }}>
                <div className="glass-card">
                    <h3 style={{ marginBottom: 'var(--space-md)' }}><FiShield style={{ marginRight: 8 }} /> Verification Status</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                        <span className={`badge ${docColors[docStatus]}`}>{docLabels[docStatus]}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                        <span className="text-sm">Approval:</span>
                        <span className={`badge badge-${driver.isApproved === 'approved' ? 'success' : driver.isApproved === 'rejected' ? 'danger' : 'warning'}`}>
                            {driver.isApproved}
                        </span>
                    </div>
                    {docStatus !== 'verified' && (
                        <button className="btn btn-secondary btn-sm" style={{ marginTop: 8 }} onClick={() => navigate('/driver/profile')}>
                            📄 Go to Profile
                        </button>
                    )}
                </div>

                <div className="glass-card">
                    <h3 style={{ marginBottom: 'var(--space-md)' }}>📊 Quick Stats</h3>
                    <div style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                            <span>Experience</span><strong>{driver.experience} years</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                            <span>Vehicle Types</span><strong>{driver.vehicleTypes?.join(', ') || '—'}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                            <span>Transmissions</span><strong>{driver.transmissions?.join(', ') || '—'}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>City</span><strong>{driver.city || '—'}</strong>
                        </div>
                    </div>
                </div>
            </div>

            {/* Active Booking Card */}
            {activeJobs.length > 0 && (
                <div className="glass-card" style={{ marginTop: 'var(--space-xl)', borderLeft: '4px solid var(--success)' }}>
                    <h3 style={{ marginBottom: 'var(--space-md)', color: 'var(--success)' }}>🟢 Current Active Booking</h3>
                    {activeJobs.slice(0, 2).map(b => (
                        <div key={b._id} className="booking-card" style={{ marginBottom: 8 }}>
                            <div className="booking-status-dot active"></div>
                            <div className="booking-info">
                                <h4>{b.pickupLocation}</h4>
                                <p>{b.durationType} • {new Date(b.startTime).toLocaleDateString()} → {new Date(b.endTime).toLocaleDateString()}</p>
                                <p className="text-sm text-muted">{b.vehicleId?.make} {b.vehicleId?.model} • Customer: {b.customerId?.name}</p>
                            </div>
                            <div className="booking-amount">{formatINR(b.totalPrice)}</div>
                        </div>
                    ))}
                    <button className="btn btn-primary btn-sm" style={{ marginTop: 8 }} onClick={() => navigate('/driver/jobs')}>Manage Jobs →</button>
                </div>
            )}

            {/* Service Area Map */}
            <div className="glass-card" style={{ marginTop: 'var(--space-xl)' }}>
                <h3 style={{ marginBottom: 'var(--space-md)' }}>📍 Your Service Area</h3>
                <MapView
                    center={cityCoords[driver.city?.toLowerCase()] || [19.076, 72.8777]}
                    zoom={13}
                    markers={[{
                        lat: (cityCoords[driver.city?.toLowerCase()] || [19.076, 72.8777])[0],
                        lng: (cityCoords[driver.city?.toLowerCase()] || [19.076, 72.8777])[1],
                        label: `${driver.userId?.name} — ${driver.city}`,
                        color: driver.isOnline ? '#00cec9' : '#e74c3c'
                    }]}
                    height="280px"
                />
                <p className="text-sm text-muted" style={{ marginTop: 'var(--space-sm)', textAlign: 'center' }}>
                    {driver.isOnline ? '🟢 You are visible to customers in this area' : '🔴 Go online to appear on the map'}
                </p>
            </div>

            {/* Pending Requests */}
            <div className="glass-card" style={{ marginTop: 'var(--space-xl)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
                    <h3>Pending Job Requests</h3>
                    <button className="btn btn-secondary btn-sm" onClick={() => navigate('/driver/jobs')}>View All</button>
                </div>
                {pendingJobs.length === 0 ? (
                    <div className="empty-state"><div className="empty-icon">📋</div><h3>No pending requests</h3></div>
                ) : (
                    pendingJobs.slice(0, 3).map(b => (
                        <div key={b._id} className="booking-card" style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <div className="booking-status-dot pending"></div>
                            <div className="booking-info">
                                <h4>{b.pickupLocation}</h4>
                                <p>{b.durationType} • {new Date(b.startTime).toLocaleDateString()} • {b.vehicleId?.make} {b.vehicleId?.model}</p>
                            </div>
                            <div className="booking-amount">{formatINR(b.totalPrice)}</div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

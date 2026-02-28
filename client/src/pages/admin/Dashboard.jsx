import { useState, useEffect } from 'react';
import { getAdminDashboard, getMaintenanceStatus, toggleMaintenance } from '../../services/api';
import { FiUsers, FiTruck, FiCalendar, FiDollarSign, FiCheckCircle, FiClock, FiAlertCircle, FiActivity } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { useTheme } from '../../context/ThemeContext';
import { formatINR, timeAgo } from '../../utils/utils';
import { PageSkeleton } from '../../components/SkeletonLoader';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [recentBookings, setRecentBookings] = useState([]);
    const { theme } = useTheme();
    const [maintenance, setMaintenance] = useState({ enabled: false, message: '' });
    const [mMsg, setMMsg] = useState('');
    const [mLoading, setMLoading] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const { data } = await getAdminDashboard();
                setStats(data.stats);
                setRecentBookings(data.recentBookings || []);
            } catch (err) { console.error(err); }
        };
        load();
        // Load maintenance status
        getMaintenanceStatus().then(res => {
            setMaintenance(res.data);
            setMMsg(res.data.message || '');
        }).catch(() => { });
    }, []);

    const handleMaintenanceToggle = async () => {
        setMLoading(true);
        try {
            const { data } = await toggleMaintenance({ enabled: !maintenance.enabled, message: mMsg });
            setMaintenance(data);
            toast[data.enabled ? 'warning' : 'success'](data.message);
        } catch (err) { console.error(err); }
        finally { setMLoading(false); }
    };

    if (!stats) return <PageSkeleton />;

    // Resolve theme-aware colors for Chart.js canvas
    const textColor = theme === 'dark' ? '#c8c8d0' : '#333340';
    const mutedColor = theme === 'dark' ? '#8888a0' : '#666680';
    const gridColor = theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.08)';

    const statCards = [
        { icon: <FiUsers />, label: 'Total Users', value: stats.totalUsers, color: 'var(--primary)' },
        { icon: <FiTruck />, label: 'Total Drivers', value: stats.totalDrivers, color: 'var(--accent)' },
        { icon: <FiCalendar />, label: 'Total Bookings', value: stats.totalBookings, color: 'var(--info)' },
        { icon: <FiDollarSign />, label: 'Revenue', value: formatINR(stats.totalRevenue || 0), color: 'var(--success)' },
        { icon: <FiCheckCircle />, label: 'Completed', value: stats.completedBookings, color: 'var(--success)' },
        { icon: <FiClock />, label: 'Pending', value: stats.pendingBookings, color: 'var(--warning)' },
        { icon: <FiAlertCircle />, label: 'Cancelled', value: stats.cancelledBookings, color: 'var(--danger)' },
        { icon: <FiActivity />, label: 'Active Now', value: stats.activeBookings, color: 'var(--info)' },
    ];

    // Chart Data — Bookings by Status
    const bookingStatusData = {
        labels: ['Completed', 'Active', 'Pending', 'Cancelled', 'Confirmed'],
        datasets: [{
            data: [
                stats.completedBookings || 0,
                stats.activeBookings || 0,
                stats.pendingBookings || 0,
                stats.cancelledBookings || 0,
                stats.confirmedBookings || 0
            ],
            backgroundColor: ['#00B894', '#74B9FF', '#FDCB6E', '#E17055', '#6C5CE7'],
            borderWidth: 0,
            borderRadius: 4,
        }]
    };

    // Chart Data — Revenue Bar (mock monthly data if not available)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const revenueData = {
        labels: months,
        datasets: [{
            label: 'Revenue (₹)',
            data: stats.monthlyRevenue || months.map((_, i) => Math.round((stats.totalRevenue || 1000) * (0.3 + Math.random() * 0.7) / 6)),
            backgroundColor: 'rgba(108, 92, 231, 0.7)',
            borderRadius: 8,
            borderSkipped: false,
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { labels: { color: textColor, font: { family: 'Inter' } } },
        },
        scales: {
            x: { ticks: { color: mutedColor }, grid: { display: false } },
            y: { ticks: { color: mutedColor }, grid: { color: gridColor } },
        }
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { color: textColor, padding: 15, font: { family: 'Inter' } } } },
        cutout: '65%'
    };

    return (
        <div>
            <div className="page-header">
                <h1>Admin Dashboard 📊</h1>
                <p>Platform overview and analytics</p>
            </div>

            <div className="stats-grid">
                {statCards.map((s, i) => (
                    <div key={i} className="stat-card">
                        <div className="stat-icon" style={{ background: `${s.color}22`, color: s.color }}>{s.icon}</div>
                        <div className="stat-info">
                            <h3>{s.value}</h3>
                            <p>{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Maintenance Mode Panel */}
            <div className="glass-card" style={{ marginBottom: 'var(--space-xl)', border: maintenance.enabled ? '2px solid var(--warning)' : '2px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                        <span style={{ fontSize: '2rem' }}>{maintenance.enabled ? '🔧' : '✅'}</span>
                        <div>
                            <h3 style={{ margin: 0 }}>Maintenance Mode</h3>
                            <p className="text-sm text-muted" style={{ margin: 0 }}>
                                {maintenance.enabled ? 'Site is DOWN — only admin can access' : 'Site is live and running normally'}
                            </p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
                        <input
                            className="form-input"
                            placeholder="Custom message (optional)"
                            value={mMsg}
                            onChange={e => setMMsg(e.target.value)}
                            style={{ width: 250, fontSize: 'var(--font-sm)' }}
                        />
                        <button
                            className={`btn ${maintenance.enabled ? 'btn-primary' : 'btn-danger'} btn-sm`}
                            onClick={handleMaintenanceToggle}
                            disabled={mLoading}
                            style={{ whiteSpace: 'nowrap' }}>
                            {mLoading ? '⏳...' : maintenance.enabled ? '✅ Go Live' : '🔧 Enable Maintenance'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-xl)', marginBottom: 'var(--space-xl)' }}>
                <div className="chart-container">
                    <h3 style={{ marginBottom: 'var(--space-md)' }}>📈 Revenue Overview</h3>
                    <div style={{ height: 280 }}>
                        <Bar key={`bar-${theme}`} data={revenueData} options={chartOptions} />
                    </div>
                </div>
                <div className="chart-container">
                    <h3 style={{ marginBottom: 'var(--space-md)' }}>📊 Booking Status</h3>
                    <div style={{ height: 280 }}>
                        <Doughnut key={`doughnut-${theme}`} data={bookingStatusData} options={doughnutOptions} />
                    </div>
                </div>
            </div>

            {/* Recent Bookings */}
            <div className="glass-card">
                <h3 style={{ marginBottom: 'var(--space-lg)' }}>Recent Bookings</h3>
                {recentBookings.length === 0 ? (
                    <div className="empty-state"><p>No bookings yet</p></div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Customer</th>
                                <th>Driver</th>
                                <th>Location</th>
                                <th>Status</th>
                                <th>Amount</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentBookings.slice(0, 8).map((b) => (
                                <tr key={b._id}>
                                    <td>{b.customerId?.name || '—'}</td>
                                    <td>{b.driverId?.userId?.name || '—'}</td>
                                    <td>{b.pickupLocation}</td>
                                    <td><span className={`badge badge-${b.status === 'completed' ? 'success' : b.status === 'cancelled' ? 'danger' : b.status === 'active' ? 'info' : 'warning'}`}>{b.status}</span></td>
                                    <td>{formatINR(b.totalPrice)}</td>
                                    <td>{timeAgo(b.createdAt)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

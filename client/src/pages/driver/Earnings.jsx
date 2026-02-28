import { useState, useEffect } from 'react';
import { getEarnings } from '../../services/api';
import { FiDollarSign, FiBriefcase, FiTrendingUp } from 'react-icons/fi';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useTheme } from '../../context/ThemeContext';
import { formatINR } from '../../utils/utils';
import { PageSkeleton } from '../../components/SkeletonLoader';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function DriverEarnings() {
    const [earnings, setEarnings] = useState(null);
    const { theme } = useTheme();

    useEffect(() => {
        const load = async () => {
            try {
                const { data } = await getEarnings();
                setEarnings(data);
            } catch (err) { console.error(err); }
        };
        load();
    }, []);

    if (!earnings) return <PageSkeleton />;

    // Fix: API returns 'bookings' not 'history'
    const history = earnings.bookings || earnings.history || [];
    const totalEarnings = earnings.totalEarnings || 0;
    const completedJobs = earnings.completedJobs || 0;
    const avgPerJob = completedJobs > 0 ? (totalEarnings / completedJobs).toFixed(0) : 0;

    // Theme-aware colors for Chart.js canvas
    const textColor = theme === 'dark' ? '#c8c8d0' : '#333340';
    const mutedColor = theme === 'dark' ? '#8888a0' : '#666680';
    const gridColor = theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.08)';

    // Chart — earnings per job (last 10)
    const chartData = {
        labels: history.slice(-10).map((h, i) => `Job #${i + 1}`),
        datasets: [{
            label: 'Earnings (₹)',
            data: history.slice(-10).map(h => h.totalPrice || h.driverEarnings || h.amount || 0),
            backgroundColor: 'rgba(0, 206, 201, 0.7)',
            borderRadius: 8,
            borderSkipped: false,
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
        },
        scales: {
            x: { ticks: { color: mutedColor }, grid: { display: false } },
            y: { ticks: { color: mutedColor }, grid: { color: gridColor } },
        }
    };

    return (
        <div>
            <div className="page-header">
                <h1>Earnings 💰</h1>
                <p>Your earning history and statistics</p>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(0, 206, 201, 0.15)', color: 'var(--accent)' }}><FiDollarSign /></div>
                    <div className="stat-info"><h3>{formatINR(totalEarnings)}</h3><p>Total Earnings</p></div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(108, 92, 231, 0.15)', color: 'var(--primary)' }}><FiBriefcase /></div>
                    <div className="stat-info"><h3>{completedJobs}</h3><p>Completed Jobs</p></div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(253, 203, 110, 0.15)', color: 'var(--warning)' }}><FiTrendingUp /></div>
                    <div className="stat-info"><h3>{formatINR(avgPerJob)}</h3><p>Avg per Job</p></div>
                </div>
            </div>

            {/* Earnings Chart */}
            <div className="chart-container" style={{ marginBottom: 'var(--space-xl)' }}>
                <h3 style={{ marginBottom: 'var(--space-md)' }}>📈 Recent Earnings</h3>
                <div style={{ height: 260 }}>
                    <Bar key={`earnings-${theme}`} data={chartData} options={chartOptions} />
                </div>
            </div>

            {/* Earnings History Table */}
            <div className="glass-card">
                <h3 style={{ marginBottom: 'var(--space-lg)' }}>Transaction History</h3>
                {history.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">💸</div>
                        <h3>No earnings yet</h3>
                        <p>Complete your first job to start earning</p>
                    </div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Pickup</th>
                                <th>Duration</th>
                                <th>Earnings</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.map((h, i) => (
                                <tr key={i}>
                                    <td>{new Date(h.completedAt || h.createdAt || h.date).toLocaleDateString()}</td>
                                    <td>{h.pickupLocation || '—'}</td>
                                    <td>{h.durationType || 'monthly'}</td>
                                    <td style={{ color: 'var(--accent)', fontWeight: 700 }}>{formatINR(h.totalPrice || h.driverEarnings || h.amount || 0)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

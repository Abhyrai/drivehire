import { useState, useEffect } from 'react';
import { getDriverJobs, acceptJob, rejectJob, completeJob } from '../../services/api';
import { toast } from 'react-toastify';

export default function JobRequests() {
    const [jobs, setJobs] = useState([]);
    const [tab, setTab] = useState('pending');
    const [loading, setLoading] = useState(true);

    const load = async () => {
        setLoading(true);
        try {
            const params = tab !== 'all' ? { status: tab } : {};
            const { data } = await getDriverJobs(params);
            setJobs(data.bookings);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, [tab]);

    const handleAccept = async (id) => {
        try { await acceptJob(id); toast.success('Job accepted!'); load(); }
        catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    };

    const handleReject = async (id) => {
        if (!window.confirm('Reject this job?')) return;
        try { await rejectJob(id, { reason: 'Not available' }); toast.info('Job rejected'); load(); }
        catch (err) { toast.error('Error'); }
    };

    const handleComplete = async (id) => {
        if (!window.confirm('Mark this job as completed?')) return;
        try { await completeJob(id); toast.success('Job completed!'); load(); }
        catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    };

    const statusColor = (s) => ({ pending: 'warning', confirmed: 'info', active: 'success', completed: 'primary', cancelled: 'danger' }[s] || 'primary');

    return (
        <div>
            <div className="page-header"><h1>Job Requests 📋</h1><p>Manage incoming booking requests</p></div>

            <div className="tabs">
                {['pending', 'confirmed', 'active', 'completed', 'cancelled', 'all'].map(t => (
                    <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                ))}
            </div>

            {loading ? <div className="loader"><div className="spinner"></div></div> : (
                <div className="drivers-grid">
                    {jobs.length === 0 ? (
                        <div className="glass-card empty-state"><div className="empty-icon">📋</div><h3>No {tab} jobs</h3></div>
                    ) : (
                        jobs.map(b => (
                            <div key={b._id} className="glass-card" style={{ padding: 'var(--space-lg)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-md)' }}>
                                    <div>
                                        <h4>{b.pickupLocation}</h4>
                                        <p className="text-sm text-muted">{b.customerId?.name} • {b.customerId?.phone}</p>
                                    </div>
                                    <span className={`badge badge-${statusColor(b.status)}`}>{b.status}</span>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-sm)', fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-md)' }}>
                                    <span>📅 {new Date(b.startTime).toLocaleString()}</span>
                                    <span>⏰ {new Date(b.endTime).toLocaleString()}</span>
                                    <span>🚗 {b.vehicleId?.make} {b.vehicleId?.model} ({b.vehicleId?.type})</span>
                                    <span>⚙️ {b.vehicleId?.transmission} • {b.durationType}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: 'var(--font-xl)', fontWeight: 800, color: 'var(--accent)' }}>₹{b.totalPrice}</span>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        {b.status === 'pending' && (
                                            <>
                                                <button className="btn btn-primary btn-sm" onClick={() => handleAccept(b._id)}>✅ Accept</button>
                                                <button className="btn btn-danger btn-sm" onClick={() => handleReject(b._id)}>❌ Reject</button>
                                            </>
                                        )}
                                        {['confirmed', 'active'].includes(b.status) && (
                                            <button className="btn btn-accent btn-sm" onClick={() => handleComplete(b._id)}>✅ Complete</button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

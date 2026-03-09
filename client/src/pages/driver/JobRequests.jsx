import { useState, useEffect } from 'react';
import { getDriverJobs, acceptJob, rejectJob, completeJob, cancelBooking } from '../../services/api';
import { toast } from 'react-toastify';
import { formatINR, timeAgo } from '../../utils/utils';

const ITEMS_PER_PAGE = 8;

export default function JobRequests() {
    const [jobs, setJobs] = useState([]);
    const [tab, setTab] = useState('pending');
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [rejectModal, setRejectModal] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [cancelModal, setCancelModal] = useState(null);
    const [cancelReason, setCancelReason] = useState('');

    const load = async () => {
        setLoading(true);
        try {
            const params = tab !== 'all' ? { status: tab } : {};
            const { data } = await getDriverJobs(params);
            setJobs(data.bookings);
            setCurrentPage(1);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, [tab]);

    const handleAccept = async (id) => {
        try { await acceptJob(id); toast.success('Job accepted! 🎉'); load(); }
        catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    };

    const handleReject = async () => {
        if (!rejectModal) return;
        try {
            await rejectJob(rejectModal, { reason: rejectReason || 'Driver declined the request' });
            toast.info('Job rejected');
            setRejectModal(null);
            setRejectReason('');
            load();
        } catch (err) { toast.error('Error'); }
    };

    const handleComplete = async (id) => {
        if (!window.confirm('Mark this job as completed?')) return;
        try { await completeJob(id); toast.success('Job completed! 💰'); load(); }
        catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    };

    const handleCancel = async () => {
        if (!cancelModal) return;
        try {
            await cancelBooking(cancelModal, { reason: cancelReason || 'Cancelled by driver' });
            toast.success('Job cancelled');
            setCancelModal(null);
            setCancelReason('');
            load();
        } catch (err) { toast.error(err.response?.data?.message || 'Error cancelling job'); }
    };

    const statusColor = (s) => ({ pending: 'warning', confirmed: 'info', active: 'success', completed: 'primary', cancelled: 'danger' }[s] || 'primary');

    // Pagination
    const totalPages = Math.ceil(jobs.length / ITEMS_PER_PAGE);
    const paginatedJobs = jobs.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    return (
        <div className="page-content">
            <div className="page-header"><h1>Job Requests 📋</h1><p>Manage incoming booking requests</p></div>

            <div className="tabs-sticky">
                <div className="tabs-scroll">
                    {['pending', 'confirmed', 'active', 'completed', 'cancelled', 'all'].map(t => (
                        <button key={t} className={`tab-pill ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                            {t.charAt(0).toUpperCase() + t.slice(1)}
                            {tab === t && <span className="tab-count">{jobs.length}</span>}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? <div className="loader"><div className="spinner"></div></div> : (
                <div className="drivers-grid">
                    {jobs.length === 0 ? (
                        <div className="glass-card empty-state"><div className="empty-icon">📋</div><h3>No {tab} jobs</h3></div>
                    ) : (
                        <>
                            {paginatedJobs.map(b => (
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
                                        <span style={{ fontSize: 'var(--font-xl)', fontWeight: 800, color: 'var(--accent)' }}>{formatINR(b.totalPrice)}</span>
                                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                            {b.status === 'pending' && (
                                                <>
                                                    <button className="btn btn-primary btn-sm" onClick={() => handleAccept(b._id)}>✅ Accept</button>
                                                    <button className="btn btn-danger btn-sm" onClick={() => { setRejectModal(b._id); setRejectReason(''); }}>❌ Reject</button>
                                                </>
                                            )}
                                            {['confirmed', 'active'].includes(b.status) && (
                                                <>
                                                    <button className="btn btn-accent btn-sm" onClick={() => handleComplete(b._id)}>✅ Complete</button>
                                                    <button className="btn btn-danger btn-sm" onClick={() => { setCancelModal(b._id); setCancelReason(''); }}>🚫 Cancel</button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    {b.cancellationReason && (
                                        <div className="text-sm text-muted" style={{ marginTop: 8, fontStyle: 'italic' }}>
                                            Cancelled: {b.cancellationReason} (by {b.cancelledBy})
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div style={{ display: 'flex', justifyContent: 'center', gap: 8, gridColumn: '1 / -1', paddingTop: 16 }}>
                                    <button className="btn btn-secondary btn-sm" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>← Prev</button>
                                    {Array.from({ length: totalPages }, (_, i) => (
                                        <button key={i} className={`btn btn-sm ${currentPage === i + 1 ? 'btn-primary' : 'btn-secondary'}`}
                                            onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
                                    ))}
                                    <button className="btn btn-secondary btn-sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next →</button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            {/* Reject Modal */}
            {rejectModal && (
                <div className="modal-overlay" onClick={() => setRejectModal(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
                        <div className="modal-header">
                            <h2>❌ Reject Job</h2>
                            <button className="modal-close" onClick={() => setRejectModal(null)}>×</button>
                        </div>
                        <p className="text-sm text-muted" style={{ marginBottom: 16 }}>
                            Let the customer know why you can't take this job.
                        </p>
                        <div className="form-group">
                            <label className="form-label">Reason</label>
                            <select className="form-select" value={rejectReason} onChange={e => setRejectReason(e.target.value)} style={{ marginBottom: 12 }}>
                                <option value="">Select a reason...</option>
                                <option value="Not available during requested dates">Not available during requested dates</option>
                                <option value="Location too far from my area">Location too far from my area</option>
                                <option value="Not comfortable with vehicle type">Not comfortable with vehicle type</option>
                                <option value="Schedule conflict with another booking">Schedule conflict with another booking</option>
                                <option value="Personal reasons">Personal reasons</option>
                            </select>
                            <textarea className="form-input" rows={2} placeholder="Or type a custom reason..."
                                value={rejectReason} onChange={e => setRejectReason(e.target.value)}></textarea>
                        </div>
                        <button className="btn btn-danger w-full" onClick={handleReject}>Reject Job</button>
                    </div>
                </div>
            )}

            {/* Cancel Modal */}
            {cancelModal && (
                <div className="modal-overlay" onClick={() => setCancelModal(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
                        <div className="modal-header">
                            <h2>🚫 Cancel Job</h2>
                            <button className="modal-close" onClick={() => setCancelModal(null)}>×</button>
                        </div>
                        <p className="text-sm text-muted" style={{ marginBottom: 16 }}>
                            Are you sure you want to cancel this job? This will notify the customer.
                        </p>
                        <div className="form-group">
                            <label className="form-label">Cancellation Reason</label>
                            <textarea className="form-input" rows={3} placeholder="Why are you cancelling?"
                                value={cancelReason} onChange={e => setCancelReason(e.target.value)}></textarea>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button className="btn btn-danger" onClick={handleCancel} style={{ flex: 1 }}>Yes, Cancel Job</button>
                            <button className="btn btn-secondary" onClick={() => setCancelModal(null)} style={{ flex: 1 }}>Go Back</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

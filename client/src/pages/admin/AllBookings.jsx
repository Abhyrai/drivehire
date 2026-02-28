import { useState, useEffect } from 'react';
import { getAdminBookings, adminCancelBooking } from '../../services/api';
import { toast } from 'react-toastify';
import { FiX, FiDownload } from 'react-icons/fi';

export default function AllBookings() {
    const [bookings, setBookings] = useState([]);
    const [tab, setTab] = useState('');
    const [cancelId, setCancelId] = useState(null);
    const [reason, setReason] = useState('');

    const load = () => {
        const params = tab ? { status: tab } : {};
        getAdminBookings(params).then(res => setBookings(res.data.bookings)).catch(console.error);
    };

    useEffect(() => { load(); }, [tab]);

    const handleCancel = async () => {
        try {
            await adminCancelBooking(cancelId, { reason: reason || 'Cancelled by admin' });
            toast.success('Booking cancelled');
            setCancelId(null);
            setReason('');
            load();
        } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    };

    const exportCSV = () => {
        const headers = ['Customer', 'Driver', 'Vehicle', 'Start', 'End', 'Amount', 'Status', 'Location', 'Created'];
        const rows = bookings.map(b => [
            b.customerId?.name || '', b.driverId?.userId?.name || '',
            `${b.vehicleId?.make || ''} ${b.vehicleId?.model || ''}`,
            new Date(b.startTime).toLocaleDateString(), new Date(b.endTime).toLocaleDateString(),
            b.totalPrice, b.status, b.pickupLocation || '', new Date(b.createdAt).toLocaleDateString()
        ]);
        const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `bookings_${new Date().toISOString().slice(0, 10)}.csv`; a.click();
        URL.revokeObjectURL(url);
        toast.success('CSV exported!');
    };

    const statusColor = (s) => ({ pending: 'warning', confirmed: 'info', active: 'success', completed: 'primary', cancelled: 'danger' }[s] || 'primary');

    return (
        <div className="page-content">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div><h1>All Bookings 📋</h1><p className="text-muted">Overview of all platform bookings</p></div>
                <button className="btn btn-secondary" onClick={exportCSV} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <FiDownload /> Export CSV
                </button>
            </div>

            <div className="tabs">
                {['', 'pending', 'confirmed', 'active', 'completed', 'cancelled'].map(t => (
                    <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                        {t ? t.charAt(0).toUpperCase() + t.slice(1) : 'All'} {t === '' ? `(${bookings.length})` : ''}
                    </button>
                ))}
            </div>

            <div className="glass-card">
                {bookings.length === 0 ? (
                    <div className="empty-state"><div className="empty-icon">📋</div><h3>No bookings found</h3></div>
                ) : (
                    <table className="data-table">
                        <thead><tr><th>Customer</th><th>Driver</th><th>Vehicle</th><th>Period</th><th>Amount</th><th>Status</th><th>Actions</th></tr></thead>
                        <tbody>
                            {bookings.map(b => (
                                <tr key={b._id}>
                                    <td>
                                        <strong>{b.customerId?.name}</strong>
                                        <div className="text-sm text-muted">{b.customerId?.email}</div>
                                    </td>
                                    <td>{b.driverId?.userId?.name || '—'}</td>
                                    <td>{b.vehicleId?.make} {b.vehicleId?.model}</td>
                                    <td className="text-sm">
                                        {new Date(b.startTime).toLocaleDateString()} → {new Date(b.endTime).toLocaleDateString()}
                                    </td>
                                    <td style={{ fontWeight: 700, color: 'var(--accent)' }}>₹{b.totalPrice?.toLocaleString()}</td>
                                    <td><span className={`badge badge-${statusColor(b.status)}`}>{b.status}</span></td>
                                    <td>
                                        {!['cancelled', 'completed'].includes(b.status) && (
                                            <button className="btn btn-danger" style={{ padding: '4px 10px', fontSize: 'var(--font-xs)' }}
                                                onClick={() => setCancelId(b._id)}>
                                                <FiX /> Cancel
                                            </button>
                                        )}
                                        {b.cancellationReason && (
                                            <div className="text-sm text-muted" style={{ marginTop: 4 }}>
                                                Reason: {b.cancellationReason}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Cancel Modal */}
            {cancelId && (
                <div className="modal-overlay" onClick={() => setCancelId(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
                        <h3>Cancel Booking</h3>
                        <p className="text-sm text-muted" style={{ marginBottom: 16 }}>This will notify both customer and driver.</p>
                        <textarea className="form-input" placeholder="Reason for cancellation..." value={reason}
                            onChange={e => setReason(e.target.value)} rows={3} style={{ marginBottom: 16 }} />
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button className="btn btn-danger" onClick={handleCancel} style={{ flex: 1 }}>Confirm Cancel</button>
                            <button className="btn btn-secondary" onClick={() => setCancelId(null)} style={{ flex: 1 }}>Back</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

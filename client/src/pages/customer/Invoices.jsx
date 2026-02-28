import { useState, useEffect } from 'react';
import { getInvoices } from '../../services/api';
import { FiDownload, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { formatINR, timeAgo } from '../../utils/utils';

export default function Invoices() {
    const [payments, setPayments] = useState([]);
    const [expanded, setExpanded] = useState(null);

    useEffect(() => {
        getInvoices().then(res => setPayments(res.data.payments)).catch(console.error);
    }, []);

    const totalPaid = payments.reduce((s, p) => s + (p.status === 'completed' ? p.amount : 0), 0);
    const totalRefund = payments.reduce((s, p) => s + (p.refundAmount || 0), 0);

    const exportCSV = () => {
        const headers = ['Transaction ID', 'Date', 'Amount', 'Method', 'Status', 'Refund'];
        const rows = payments.map(p => [
            p.transactionId, new Date(p.createdAt).toLocaleDateString(),
            p.amount, p.method, p.status, p.refundAmount || 0
        ]);
        const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url;
        a.download = `invoices_${new Date().toISOString().slice(0, 10)}.csv`; a.click();
        URL.revokeObjectURL(url);
        toast.success('CSV exported!');
    };

    return (
        <div className="page-content">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div><h1>Invoices & Payments 💳</h1><p className="text-muted">View your payment history</p></div>
                {payments.length > 0 && (
                    <button className="btn btn-secondary" onClick={exportCSV} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <FiDownload /> Export CSV
                    </button>
                )}
            </div>

            {/* Summary Cards */}
            <div className="stats-grid" style={{ marginBottom: 'var(--space-2xl)' }}>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(0, 206, 158, 0.2)', color: 'var(--success)' }}>💰</div>
                    <div className="stat-info"><h3>{formatINR(totalPaid)}</h3><p>Total Paid</p></div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(253, 203, 110, 0.2)', color: 'var(--warning)' }}>🔄</div>
                    <div className="stat-info"><h3>{formatINR(totalRefund)}</h3><p>Total Refunds</p></div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(108, 92, 231, 0.2)', color: 'var(--primary)' }}>📄</div>
                    <div className="stat-info"><h3>{payments.length}</h3><p>Transactions</p></div>
                </div>
            </div>

            <div className="glass-card">
                {payments.length === 0 ? (
                    <div className="empty-state"><div className="empty-icon">💳</div><h3>No invoices yet</h3><p>Complete a booking to see your invoices here</p></div>
                ) : (
                    <table className="data-table">
                        <thead><tr><th>Transaction ID</th><th>Date</th><th>Amount</th><th>Method</th><th>Status</th><th>Details</th></tr></thead>
                        <tbody>
                            {payments.map(p => (
                                <>
                                    <tr key={p._id} style={{ cursor: 'pointer' }} onClick={() => setExpanded(expanded === p._id ? null : p._id)}>
                                        <td style={{ fontFamily: 'monospace', fontSize: 'var(--font-xs)' }}>{p.transactionId}</td>
                                        <td>{timeAgo(p.createdAt)}</td>
                                        <td style={{ fontWeight: 700, color: 'var(--accent)' }}>{formatINR(p.amount)}</td>
                                        <td><span className="badge badge-secondary">{p.method}</span></td>
                                        <td><span className={`badge badge-${p.status === 'completed' ? 'success' : p.status === 'refunded' ? 'warning' : 'danger'}`}>{p.status}</span></td>
                                        <td>{expanded === p._id ? <FiChevronUp /> : <FiChevronDown />}</td>
                                    </tr>
                                    {expanded === p._id && p.bookingId && (
                                        <tr key={`${p._id}-detail`}>
                                            <td colSpan={6} style={{ background: 'rgba(108,92,231,0.04)', padding: 16 }}>
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16, fontSize: 'var(--font-sm)' }}>
                                                    <div><strong>Booking Period</strong><br />{new Date(p.bookingId.startTime).toLocaleDateString()} → {new Date(p.bookingId.endTime).toLocaleDateString()}</div>
                                                    <div><strong>Duration</strong><br />{p.bookingId.durationType}</div>
                                                    <div><strong>Booking Total</strong><br />{formatINR(p.bookingId.totalPrice)}</div>
                                                    <div><strong>Booking Status</strong><br /><span className={`badge badge-${p.bookingId.status === 'completed' ? 'success' : 'primary'}`}>{p.bookingId.status}</span></div>
                                                    {p.refundAmount > 0 && <div><strong>Refund Amount</strong><br />{formatINR(p.refundAmount)}</div>}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

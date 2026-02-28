import { useState, useEffect } from 'react';
import { getAdminPayments } from '../../services/api';
import { FiDownload } from 'react-icons/fi';
import { toast } from 'react-toastify';

export default function Payments() {
    const [payments, setPayments] = useState([]);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        getAdminPayments().then(res => setPayments(res.data.payments)).catch(console.error);
    }, []);

    const filtered = filter ? payments.filter(p => p.status === filter) : payments;
    const totalRevenue = payments.reduce((s, p) => s + (p.status === 'completed' ? p.amount : 0), 0);
    const totalRefunds = payments.reduce((s, p) => s + (p.refundAmount || 0), 0);

    const exportCSV = () => {
        const headers = ['Transaction ID', 'Customer', 'Amount', 'Method', 'Status', 'Refund', 'Date'];
        const rows = filtered.map(p => [
            p.transactionId, p.customerId?.name || '', p.amount, p.method, p.status,
            p.refundAmount || 0, new Date(p.createdAt).toLocaleDateString()
        ]);
        const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url;
        a.download = `payments_${new Date().toISOString().slice(0, 10)}.csv`; a.click();
        URL.revokeObjectURL(url);
        toast.success('CSV exported!');
    };

    return (
        <div className="page-content">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div><h1>Payments 💳</h1><p className="text-muted">All platform transactions</p></div>
                <button className="btn btn-secondary" onClick={exportCSV} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <FiDownload /> Export CSV
                </button>
            </div>

            {/* Revenue Summary */}
            <div className="stats-grid" style={{ marginBottom: 'var(--space-2xl)' }}>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(0, 206, 158, 0.2)', color: 'var(--success)' }}>💰</div>
                    <div className="stat-info"><h3>₹{totalRevenue.toLocaleString()}</h3><p>Total Revenue</p></div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(253, 203, 110, 0.2)', color: 'var(--warning)' }}>🔄</div>
                    <div className="stat-info"><h3>₹{totalRefunds.toLocaleString()}</h3><p>Total Refunds</p></div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(108, 92, 231, 0.2)', color: 'var(--primary)' }}>📊</div>
                    <div className="stat-info"><h3>{payments.length}</h3><p>Total Transactions</p></div>
                </div>
            </div>

            {/* Status Filter */}
            <div className="tabs" style={{ marginBottom: 'var(--space-lg)' }}>
                {['', 'completed', 'pending', 'refunded', 'failed'].map(s => (
                    <button key={s} className={`tab ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>
                        {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
                    </button>
                ))}
            </div>

            <div className="glass-card">
                {filtered.length === 0 ? (
                    <div className="empty-state"><div className="empty-icon">💳</div><h3>No payments yet</h3></div>
                ) : (
                    <table className="data-table">
                        <thead><tr><th>Transaction ID</th><th>Customer</th><th>Amount</th><th>Method</th><th>Status</th><th>Refund</th><th>Date</th></tr></thead>
                        <tbody>
                            {filtered.map(p => (
                                <tr key={p._id}>
                                    <td style={{ fontFamily: 'monospace', fontSize: 'var(--font-xs)' }}>{p.transactionId}</td>
                                    <td>
                                        <strong>{p.customerId?.name}</strong>
                                        <div className="text-sm text-muted">{p.customerId?.email}</div>
                                    </td>
                                    <td style={{ fontWeight: 700, color: 'var(--accent)' }}>₹{p.amount?.toLocaleString()}</td>
                                    <td><span className="badge badge-secondary">{p.method}</span></td>
                                    <td><span className={`badge badge-${p.status === 'completed' ? 'success' : p.status === 'refunded' ? 'warning' : 'danger'}`}>{p.status}</span></td>
                                    <td>{p.refundAmount > 0 ? `₹${p.refundAmount.toLocaleString()}` : '—'}</td>
                                    <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

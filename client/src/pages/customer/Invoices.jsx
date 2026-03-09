import { useState, useEffect } from 'react';
import { getInvoices } from '../../services/api';
import { FiDownload, FiChevronDown, FiChevronUp, FiFileText } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { formatINR, timeAgo } from '../../utils/utils';

const downloadInvoicePDF = (payment) => {
    const b = payment.bookingId || {};
    const html = `<!DOCTYPE html><html><head><title>Invoice - ${payment.transactionId}</title>
    <style>body{font-family:Arial,sans-serif;max-width:700px;margin:40px auto;padding:20px;color:#333}
    h1{color:#6c5ce7;margin-bottom:4px}h2{margin:24px 0 12px;border-bottom:2px solid #6c5ce7;padding-bottom:4px}
    table{width:100%;border-collapse:collapse;margin:12px 0}th,td{padding:8px 12px;text-align:left;border-bottom:1px solid #eee}
    th{background:#f8f9fa;font-weight:700}.total{font-size:1.4em;color:#6c5ce7;font-weight:800}
    .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px}
    .badge{display:inline-block;padding:2px 8px;border-radius:4px;font-size:12px;font-weight:700}
    .paid{background:#d4edda;color:#155724}.pending{background:#fff3cd;color:#856404}
    @media print{body{margin:0}}</style></head><body>
    <div class="header"><div><h1>🚗 DriveHire</h1><p style="color:#666;margin:4px 0">Invoice</p></div>
    <div style="text-align:right"><strong>Invoice #</strong><br>${payment.transactionId}<br>
    <strong>Date:</strong> ${new Date(payment.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div></div>
    <h2>Payment Details</h2>
    <table><tr><th>Amount</th><td class="total">${formatINR(payment.amount)}</td></tr>
    <tr><th>Method</th><td>${(payment.method || 'Cash').toUpperCase()}</td></tr>
    <tr><th>Status</th><td><span class="badge ${payment.status === 'completed' ? 'paid' : 'pending'}">${payment.status}</span></td></tr>
    ${payment.refundAmount > 0 ? `<tr><th>Refund</th><td>${formatINR(payment.refundAmount)}</td></tr>` : ''}</table>
    ${b.startTime ? `<h2>Booking Details</h2><table>
    <tr><th>Period</th><td>${new Date(b.startTime).toLocaleDateString('en-IN')} → ${new Date(b.endTime).toLocaleDateString('en-IN')}</td></tr>
    <tr><th>Duration</th><td>${b.durationType || 'Monthly'}</td></tr>
    <tr><th>Booking Total</th><td>${formatINR(b.totalPrice)}</td></tr>
    <tr><th>Status</th><td>${b.status}</td></tr></table>` : ''}
    <div style="margin-top:40px;text-align:center;color:#999;font-size:12px;border-top:1px solid #eee;padding-top:16px">
    <p>DriveHire — On-Demand Driver Hiring Platform</p><p>support@drivehire.in | +91-9876543210</p></div>
    <script>window.print();</script></body></html>`;
    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
};

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
                                                <button className="btn btn-primary btn-sm" style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6 }}
                                                    onClick={(e) => { e.stopPropagation(); downloadInvoicePDF(p); }}>
                                                    <FiFileText /> Download Invoice PDF
                                                </button>
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

import { useState, useEffect } from 'react';
import { getAllTickets, replyToTicket, updateTicketStatus, deleteTicket } from '../../services/api';
import { FiClock, FiMessageSquare, FiFilter } from 'react-icons/fi';
import { toast } from 'react-toastify';

const statusColors = {
    open: 'badge-warning', in_progress: 'badge-info', resolved: 'badge-success', closed: 'badge-primary'
};
const priorityLabels = { high: '🔴 High', medium: '🟡 Medium', low: '🟢 Low' };

export default function SupportTickets() {
    const [tickets, setTickets] = useState([]);
    const [filter, setFilter] = useState({ status: '', priority: '' });
    const [replyModal, setReplyModal] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [replyStatus, setReplyStatus] = useState('in_progress');
    const [loading, setLoading] = useState(false);

    useEffect(() => { loadTickets(); }, [filter]);

    const loadTickets = async () => {
        try {
            const params = {};
            if (filter.status) params.status = filter.status;
            if (filter.priority) params.priority = filter.priority;
            const { data } = await getAllTickets(params);
            setTickets(data.tickets);
        } catch (err) { console.error(err); }
    };

    const handleReply = async () => {
        if (!replyText.trim()) return;
        setLoading(true);
        try {
            await replyToTicket(replyModal._id, { reply: replyText, status: replyStatus });
            toast.success('Reply sent!');
            setReplyModal(null);
            setReplyText('');
            loadTickets();
        } catch (err) { toast.error('Failed to reply'); }
        finally { setLoading(false); }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await updateTicketStatus(id, { status });
            toast.success('Status updated');
            loadTickets();
        } catch (err) { toast.error('Failed to update'); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to permanently delete this ticket?')) return;
        try {
            await deleteTicket(id);
            toast.success('Ticket deleted');
            loadTickets();
        } catch (err) { toast.error('Failed to delete ticket'); }
    };

    return (
        <div>
            <div className="page-header">
                <h1>Support Tickets 🎫</h1>
                <p>Manage user support requests</p>
            </div>

            <div className="filter-bar">
                <div className="form-group">
                    <label className="form-label">Status</label>
                    <select className="form-select" value={filter.status} onChange={(e) => setFilter({ ...filter, status: e.target.value })}>
                        <option value="">All</option>
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                    </select>
                </div>
                <div className="form-group">
                    <label className="form-label">Priority</label>
                    <select className="form-select" value={filter.priority} onChange={(e) => setFilter({ ...filter, priority: e.target.value })}>
                        <option value="">All</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                    </select>
                </div>
            </div>

            <div className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
                    <h3>All Tickets ({tickets.length})</h3>
                </div>

                {tickets.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🎫</div>
                        <h3>No tickets found</h3>
                    </div>
                ) : (
                    tickets.map((t) => (
                        <div key={t._id} className="ticket-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-sm)', marginBottom: 'var(--space-sm)' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 4 }}>
                                        <span className={`ticket-priority ${t.priority}`}></span>
                                        <strong>{t.subject}</strong>
                                    </div>
                                    <p className="text-sm text-muted">
                                        By: <strong>{t.userId?.name}</strong> ({t.userId?.email}) — {t.userId?.role}
                                    </p>
                                </div>
                                <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
                                    <span className={`badge ${statusColors[t.status]}`}>{t.status.replace('_', ' ')}</span>
                                    <span className="badge badge-primary">{t.category}</span>
                                    <span className="text-sm text-muted">{priorityLabels[t.priority]}</span>
                                </div>
                            </div>

                            <p className="text-sm" style={{ marginBottom: 'var(--space-sm)' }}>{t.description}</p>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
                                <p className="text-sm text-muted">
                                    <FiClock size={12} style={{ marginRight: 4 }} />
                                    {new Date(t.createdAt).toLocaleDateString()} {new Date(t.createdAt).toLocaleTimeString()}
                                </p>

                                {t.adminReply && (
                                    <span className="badge badge-success">✅ Replied</span>
                                )}
                            </div>

                            {t.adminReply && (
                                <div style={{ marginTop: 'var(--space-sm)', padding: 'var(--space-sm) var(--space-md)', background: 'rgba(0, 184, 148, 0.08)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--success)' }}>
                                    <p className="text-sm"><strong>Your reply:</strong> {t.adminReply}</p>
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-md)' }}>
                                <button className="btn btn-primary btn-sm" onClick={() => { setReplyModal(t); setReplyText(t.adminReply || ''); }}>
                                    <FiMessageSquare /> Reply
                                </button>
                                {t.status !== 'closed' && (
                                    <button className="btn btn-secondary btn-sm" onClick={() => handleStatusUpdate(t._id, 'closed')}>
                                        Close
                                    </button>
                                )}
                                {t.status === 'open' && (
                                    <button className="btn btn-secondary btn-sm" onClick={() => handleStatusUpdate(t._id, 'in_progress')}>
                                        Mark In Progress
                                    </button>
                                )}
                                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(t._id)}
                                    style={{ marginLeft: 'auto' }}>
                                    🗑️ Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Reply Modal */}
            {replyModal && (
                <div className="modal-overlay" onClick={() => setReplyModal(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Reply to: {replyModal.subject}</h2>
                            <button className="modal-close" onClick={() => setReplyModal(null)}>×</button>
                        </div>
                        <div style={{ marginBottom: 'var(--space-md)', padding: 'var(--space-md)', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }}>
                            <p className="text-sm text-muted">Original message:</p>
                            <p className="text-sm">{replyModal.description}</p>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Your Reply</label>
                            <textarea className="form-input" value={replyText} onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Type your reply to the user..." style={{ minHeight: '100px' }} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Update Status</label>
                            <select className="form-select" value={replyStatus} onChange={(e) => setReplyStatus(e.target.value)}>
                                <option value="in_progress">In Progress</option>
                                <option value="resolved">Resolved</option>
                                <option value="closed">Closed</option>
                            </select>
                        </div>
                        <button className="btn btn-primary w-full" onClick={handleReply} disabled={loading}>
                            {loading ? 'Sending...' : '📩 Send Reply'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

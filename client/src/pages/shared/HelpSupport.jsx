import { useState, useEffect } from 'react';
import { createTicket, getMyTickets } from '../../services/api';
import { FiSend, FiClock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';

const statusColors = {
    open: 'badge-warning', in_progress: 'badge-info', resolved: 'badge-success', closed: 'badge-primary'
};

export default function HelpSupport() {
    const [tickets, setTickets] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ subject: '', description: '', category: 'other', priority: 'medium' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadTickets();
    }, []);

    const loadTickets = async () => {
        try {
            const { data } = await getMyTickets();
            setTickets(data.tickets);
        } catch (err) { console.error(err); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createTicket(form);
            toast.success('Support ticket submitted! We will get back to you soon.');
            setForm({ subject: '', description: '', category: 'other', priority: 'medium' });
            setShowForm(false);
            loadTickets();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create ticket');
        } finally { setLoading(false); }
    };

    return (
        <div>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div>
                    <h1>Help & Support 🛟</h1>
                    <p>Need help? Submit a ticket and our team will assist you</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                    {showForm ? 'Cancel' : '📝 New Ticket'}
                </button>
            </div>

            {showForm && (
                <div className="glass-card" style={{ marginBottom: 'var(--space-xl)' }}>
                    <h3 style={{ marginBottom: 'var(--space-lg)' }}>Submit a Support Ticket</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Subject</label>
                            <input className="form-input" placeholder="Brief description of your issue" value={form.subject}
                                onChange={(e) => setForm({ ...form, subject: e.target.value })} required maxLength={200} />
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Category</label>
                                <select className="form-select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                                    <option value="booking">Booking Issue</option>
                                    <option value="payment">Payment Issue</option>
                                    <option value="driver">Driver Issue</option>
                                    <option value="account">Account Issue</option>
                                    <option value="technical">Technical Issue</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Priority</label>
                                <select className="form-select" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Description</label>
                            <textarea className="form-input" placeholder="Describe your issue in detail..." value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })} required maxLength={2000}
                                style={{ minHeight: '120px' }} />
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Submitting...' : '📩 Submit Ticket'}
                        </button>
                    </form>
                </div>
            )}

            <div className="glass-card">
                <h3 style={{ marginBottom: 'var(--space-lg)' }}>My Tickets ({tickets.length})</h3>
                {tickets.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🎫</div>
                        <h3>No tickets yet</h3>
                        <p>Submit a ticket if you need help with anything</p>
                    </div>
                ) : (
                    tickets.map((t) => (
                        <div key={t._id} className="ticket-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                                    <span className={`ticket-priority ${t.priority}`}></span>
                                    <strong>{t.subject}</strong>
                                </div>
                                <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                                    <span className={`badge ${statusColors[t.status]}`}>{t.status.replace('_', ' ')}</span>
                                    <span className="badge badge-primary">{t.category}</span>
                                </div>
                            </div>
                            <p className="text-sm text-muted" style={{ marginBottom: 'var(--space-sm)' }}>{t.description}</p>
                            <p className="text-sm text-muted">
                                <FiClock size={12} style={{ marginRight: 4 }} />
                                {new Date(t.createdAt).toLocaleDateString()} at {new Date(t.createdAt).toLocaleTimeString()}
                            </p>
                            {t.adminReply && (
                                <div style={{ marginTop: 'var(--space-md)', padding: 'var(--space-md)', background: 'rgba(108, 92, 231, 0.08)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--primary)' }}>
                                    <p className="text-sm" style={{ fontWeight: 600, marginBottom: 4 }}>👨‍💼 Admin Reply:</p>
                                    <p className="text-sm">{t.adminReply}</p>
                                    <p className="text-sm text-muted" style={{ marginTop: 4 }}>
                                        {new Date(t.repliedAt).toLocaleDateString()}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

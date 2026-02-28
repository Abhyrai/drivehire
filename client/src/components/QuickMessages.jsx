import { useState, useEffect, useRef } from 'react';
import { getMessageTemplates, sendQuickMessage, getBookingMessages } from '../services/api';
import { toast } from 'react-toastify';

/**
 * QuickMessages — Pre-defined message panel for active bookings
 * Only allows sending pre-written messages (no free text for safety)
 * 
 * @param {string} props.bookingId - The booking ID
 * @param {string} props.bookingStatus - Current booking status
 */
export default function QuickMessages({ bookingId, bookingStatus }) {
    const [templates, setTemplates] = useState([]);
    const [messages, setMessages] = useState([]);
    const [sending, setSending] = useState(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        loadTemplates();
        loadMessages();
        // Poll for new messages every 10 seconds
        const interval = setInterval(loadMessages, 10000);
        return () => clearInterval(interval);
    }, [bookingId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const loadTemplates = async () => {
        try {
            const { data } = await getMessageTemplates();
            setTemplates(data.templates);
        } catch (err) { console.error(err); }
    };

    const loadMessages = async () => {
        try {
            const { data } = await getBookingMessages(bookingId);
            setMessages(data.messages);
        } catch (err) { console.error(err); }
    };

    const handleSend = async (key) => {
        setSending(key);
        try {
            await sendQuickMessage(bookingId, { messageKey: key });
            loadMessages();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send');
        } finally { setSending(null); }
    };

    const isActive = ['confirmed', 'active'].includes(bookingStatus);

    if (!isActive) {
        return (
            <div className="glass-card">
                <h3 style={{ marginBottom: 'var(--space-md)' }}>💬 Quick Messages</h3>
                <div className="empty-state" style={{ padding: 'var(--space-lg)' }}>
                    <p className="text-sm text-muted">Messages are only available for confirmed or active bookings</p>
                </div>
            </div>
        );
    }

    return (
        <div className="glass-card">
            <h3 style={{ marginBottom: 'var(--space-sm)' }}>💬 Quick Messages</h3>
            <p className="text-sm text-muted" style={{ marginBottom: 'var(--space-md)' }}>
                Send pre-defined messages to communicate safely
            </p>

            {/* Message History */}
            <div style={{
                maxHeight: '300px', overflowY: 'auto', marginBottom: 'var(--space-lg)',
                padding: 'var(--space-md)', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)',
                display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)',
            }}>
                {messages.length === 0 ? (
                    <p className="text-sm text-muted" style={{ textAlign: 'center', padding: 'var(--space-lg)' }}>
                        No messages yet. Send a quick message below!
                    </p>
                ) : (
                    messages.map((msg, i) => (
                        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.senderRole === 'customer' ? 'flex-end' : 'flex-start' }}>
                            <div className={`msg-bubble ${msg.senderRole === 'customer' ? 'sent' : 'received'}`}>
                                {msg.messageText}
                            </div>
                            <span className="msg-time">
                                {msg.senderRole === 'customer' ? 'You' : 'Driver'} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Quick Message Buttons */}
            <div className="quick-messages">
                <p className="text-sm text-muted" style={{ marginBottom: 'var(--space-xs)' }}>Tap to send:</p>
                {templates.map((t) => (
                    <button key={t.key} className={`quick-msg-btn ${messages.some(m => m.messageKey === t.key) ? 'sent' : ''}`}
                        onClick={() => handleSend(t.key)} disabled={sending === t.key}>
                        <span>{t.icon}</span>
                        <span style={{ flex: 1 }}>{t.text}</span>
                        {sending === t.key && <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }}></span>}
                    </button>
                ))}
            </div>
        </div>
    );
}

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../services/api';
import { FiBell, FiCheck, FiCheckCircle, FiX } from 'react-icons/fi';

export default function NotificationBell() {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const ref = useRef(null);
    const navigate = useNavigate();

    const load = async () => {
        try {
            const { data } = await getNotifications();
            setNotifications(data.notifications || []);
            setUnreadCount(data.unreadCount || 0);
        } catch { }
    };

    // Load on mount + poll every 30s
    useEffect(() => {
        load();
        const interval = setInterval(load, 30000);
        return () => clearInterval(interval);
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleRead = async (notif) => {
        if (!notif.isRead) {
            await markNotificationRead(notif._id);
            setUnreadCount(prev => Math.max(0, prev - 1));
            setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n));
        }
        if (notif.link) {
            navigate(notif.link);
            setOpen(false);
        }
    };

    const handleMarkAll = async () => {
        setLoading(true);
        await markAllNotificationsRead();
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
        setLoading(false);
    };

    const timeAgo = (date) => {
        const diff = (Date.now() - new Date(date).getTime()) / 1000;
        if (diff < 60) return 'just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return `${Math.floor(diff / 86400)}d ago`;
    };

    return (
        <div ref={ref} style={{ position: 'relative' }}>
            {/* Bell Button */}
            <button
                onClick={() => { setOpen(!open); if (!open) load(); }}
                className="btn btn-secondary"
                style={{
                    position: 'relative',
                    padding: '8px',
                    borderRadius: '50%',
                    width: 40, height: 40,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    color: 'var(--text-primary)', fontSize: '1.25rem'
                }}
                title="Notifications"
            >
                <FiBell />
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute', top: 2, right: 2,
                        background: 'var(--danger)', color: '#fff',
                        borderRadius: '50%', width: 18, height: 18,
                        fontSize: '0.65rem', fontWeight: 700,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: '2px solid var(--bg-primary)',
                        animation: 'pulse 2s ease-in-out infinite'
                    }}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {open && (
                <div className="notif-dropdown">
                    {/* Header */}
                    <div className="notif-dropdown-header">
                        <strong>
                            🔔 Notifications {unreadCount > 0 && <span className="badge badge-primary" style={{ marginLeft: 6 }}>{unreadCount}</span>}
                        </strong>
                        {unreadCount > 0 && (
                            <button onClick={handleMarkAll} disabled={loading} className="notif-mark-all">
                                <FiCheckCircle size={14} /> Mark all read
                            </button>
                        )}
                    </div>

                    {/* Notification List */}
                    {notifications.length === 0 ? (
                        <div className="notif-empty">
                            <FiBell size={28} style={{ opacity: 0.4 }} />
                            <span>You have no notifications yet</span>
                        </div>
                    ) : (
                        notifications.slice(0, 20).map(n => (
                            <div
                                key={n._id}
                                onClick={() => handleRead(n)}
                                style={{
                                    padding: '12px 16px',
                                    borderBottom: '1px solid var(--border)',
                                    cursor: 'pointer',
                                    background: n.isRead ? 'transparent' : 'rgba(108, 92, 231, 0.06)',
                                    transition: 'background 0.2s',
                                    display: 'flex', gap: 12, alignItems: 'flex-start'
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(108, 92, 231, 0.1)'}
                                onMouseLeave={e => e.currentTarget.style.background = n.isRead ? 'transparent' : 'rgba(108, 92, 231, 0.06)'}
                            >
                                {/* Unread dot */}
                                <div style={{
                                    width: 8, height: 8, borderRadius: '50%',
                                    background: n.isRead ? 'transparent' : 'var(--primary)',
                                    flexShrink: 0, marginTop: 6
                                }} />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{
                                        fontWeight: n.isRead ? 400 : 600,
                                        fontSize: 'var(--font-sm)',
                                        marginBottom: 2
                                    }}>
                                        {n.title}
                                    </div>
                                    <div style={{
                                        fontSize: '0.8rem',
                                        color: 'var(--text-muted)',
                                        lineHeight: 1.4,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical'
                                    }}>
                                        {n.message}
                                    </div>
                                    <div style={{
                                        fontSize: '0.7rem',
                                        color: 'var(--text-muted)',
                                        marginTop: 4, opacity: 0.7
                                    }}>
                                        {timeAgo(n.createdAt)}
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

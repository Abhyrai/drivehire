import { useState, useEffect } from 'react';
import { getDriverReviews } from '../../services/api';

export default function DriverReviews() {
    const [data, setData] = useState({ rating: 0, totalReviews: 0, reviews: [] });

    useEffect(() => {
        getDriverReviews().then(res => setData(res.data)).catch(console.error);
    }, []);

    // Rating breakdown
    const breakdown = [5, 4, 3, 2, 1].map(star => {
        const count = data.reviews.filter(r => r.rating === star).length;
        const pct = data.totalReviews > 0 ? (count / data.totalReviews) * 100 : 0;
        return { star, count, pct };
    });

    return (
        <div className="page-content">
            <div className="page-header"><h1>My Reviews ⭐</h1><p className="text-muted">See what customers say about you</p></div>

            <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: 'var(--space-2xl)', marginBottom: 'var(--space-2xl)', alignItems: 'start' }}>
                {/* Summary Card */}
                <div className="glass-card" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--warning)', lineHeight: 1 }}>
                        {data.rating ? Number(data.rating).toFixed(1) : '—'}
                    </div>
                    <div style={{ margin: '8px 0', color: 'var(--warning)', fontSize: '1.2rem' }}>
                        {'★'.repeat(Math.round(data.rating || 0))}{'☆'.repeat(5 - Math.round(data.rating || 0))}
                    </div>
                    <p className="text-sm text-muted">{data.totalReviews} review{data.totalReviews !== 1 ? 's' : ''}</p>
                </div>

                {/* Rating Breakdown */}
                <div className="glass-card">
                    <h3 style={{ marginBottom: 'var(--space-md)' }}>Rating Breakdown</h3>
                    {breakdown.map(({ star, count, pct }) => (
                        <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                            <span style={{ width: 30, textAlign: 'right', fontWeight: 600, fontSize: 'var(--font-sm)' }}>{star}★</span>
                            <div style={{ flex: 1, height: 10, background: 'var(--bg-secondary)', borderRadius: 5, overflow: 'hidden' }}>
                                <div style={{
                                    width: `${pct}%`, height: '100%', borderRadius: 5,
                                    background: star >= 4 ? 'var(--success)' : star === 3 ? 'var(--warning)' : 'var(--danger)',
                                    transition: 'width 0.5s ease'
                                }} />
                            </div>
                            <span className="text-sm text-muted" style={{ width: 50 }}>{count} ({Math.round(pct)}%)</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Reviews List */}
            <div className="drivers-grid">
                {data.reviews.length === 0 ? (
                    <div className="glass-card empty-state"><div className="empty-icon">⭐</div><h3>No reviews yet</h3><p>Complete jobs to receive reviews</p></div>
                ) : (
                    data.reviews.map(r => (
                        <div key={r._id} className="glass-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-sm)' }}>
                                <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
                                    <div className="driver-avatar" style={{ width: 36, height: 36, fontSize: 'var(--font-sm)' }}>
                                        {r.customerId?.name?.charAt(0) || 'C'}
                                    </div>
                                    <div>
                                        <strong>{r.customerId?.name || 'Customer'}</strong>
                                        <div className="text-sm text-muted">{new Date(r.createdAt).toLocaleDateString()}</div>
                                    </div>
                                </div>
                                <div style={{ color: 'var(--warning)', whiteSpace: 'nowrap' }}>
                                    {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                                </div>
                            </div>
                            <p className="text-sm" style={{ color: 'var(--text-secondary)', fontStyle: r.comment ? 'normal' : 'italic' }}>
                                {r.comment || 'No comment left'}
                            </p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

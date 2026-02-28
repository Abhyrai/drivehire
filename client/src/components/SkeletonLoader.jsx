export function CardSkeleton({ count = 1 }) {
    return Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton skeleton-card" />
    ));
}

export function StatSkeleton({ count = 4 }) {
    return (
        <div className="stats-grid">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="skeleton skeleton-stat" />
            ))}
        </div>
    );
}

export function TableSkeleton({ rows = 5, cols = 5 }) {
    return (
        <div className="glass-card">
            {Array.from({ length: rows }).map((_, r) => (
                <div key={r} style={{ display: 'flex', gap: 16, padding: '12px 0', borderBottom: '1px solid var(--border-color)' }}>
                    {Array.from({ length: cols }).map((_, c) => (
                        <div key={c} className="skeleton skeleton-text" style={{ flex: 1, width: 'auto' }} />
                    ))}
                </div>
            ))}
        </div>
    );
}

export function PageSkeleton() {
    return (
        <div className="page-content">
            <div style={{ marginBottom: 32 }}>
                <div className="skeleton skeleton-text" style={{ width: 200, height: 28 }} />
                <div className="skeleton skeleton-text short" style={{ marginTop: 8 }} />
            </div>
            <StatSkeleton />
            <div style={{ marginTop: 24 }}>
                <TableSkeleton />
            </div>
        </div>
    );
}

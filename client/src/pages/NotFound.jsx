import { useNavigate } from 'react-router-dom';

export default function NotFound() {
    const navigate = useNavigate();

    return (
        <div className="not-found-page">
            <div className="big-404">404</div>
            <h2 style={{ fontSize: 'var(--font-2xl)', marginBottom: 'var(--space-md)' }}>
                Page Not Found
            </h2>
            <p className="text-muted" style={{ marginBottom: 'var(--space-xl)', maxWidth: 400 }}>
                The page you're looking for doesn't exist or has been moved. Let's get you back on track.
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
                <button className="btn btn-primary" onClick={() => navigate(-1)}>
                    ← Go Back
                </button>
                <button className="btn btn-secondary" onClick={() => navigate('/')}>
                    🏠 Home
                </button>
            </div>
        </div>
    );
}

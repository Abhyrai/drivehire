import { Component } from 'react';

export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, info) {
        console.error('ErrorBoundary caught:', error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: '1rem',
                    padding: '2rem',
                    textAlign: 'center',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)'
                }}>
                    <div style={{ fontSize: '4rem' }}>⚠️</div>
                    <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}>Something went wrong</h1>
                    <p style={{ color: 'var(--text-secondary)', maxWidth: 400 }}>
                        An unexpected error occurred. Please try refreshing the page.
                    </p>
                    <button
                        className="btn btn-primary"
                        onClick={() => window.location.reload()}
                    >
                        Refresh Page
                    </button>
                    {this.state.error && (
                        <details style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            <summary>Error details</summary>
                            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxWidth: 500, textAlign: 'left' }}>
                                {this.state.error.toString()}
                            </pre>
                        </details>
                    )}
                </div>
            );
        }
        return this.props.children;
    }
}

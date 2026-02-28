const STEPS = ['pending', 'confirmed', 'active', 'completed'];
const LABELS = { pending: 'Pending', confirmed: 'Confirmed', active: 'Active', completed: 'Completed' };

export default function StatusTimeline({ status }) {
    const currentIndex = STEPS.indexOf(status);
    const isCancelled = status === 'cancelled';

    if (isCancelled) {
        return (
            <div className="status-timeline">
                {STEPS.map((step, i) => {
                    const wasDone = i < STEPS.indexOf('cancelled') || false;
                    return (
                        <div key={step} style={{ display: 'contents' }}>
                            <div className="timeline-step">
                                <div className={`timeline-dot ${step === 'pending' ? 'done' : ''}`}>
                                    {step === 'pending' ? '✓' : ''}
                                </div>
                                <span className={`timeline-label ${step === 'pending' ? 'done' : ''}`}>
                                    {LABELS[step]}
                                </span>
                            </div>
                            {i < STEPS.length - 1 && <div className="timeline-line" />}
                        </div>
                    );
                })}
                <div className="timeline-step">
                    <div className="timeline-dot" style={{ background: 'var(--danger)', borderColor: 'var(--danger)', color: 'white' }}>✕</div>
                    <span className="timeline-label" style={{ color: 'var(--danger)' }}>Cancelled</span>
                </div>
            </div>
        );
    }

    return (
        <div className="status-timeline">
            {STEPS.map((step, i) => {
                const isDone = i < currentIndex;
                const isActive = i === currentIndex;
                return (
                    <div key={step} style={{ display: 'contents' }}>
                        <div className="timeline-step">
                            <div className={`timeline-dot ${isDone ? 'done' : ''} ${isActive ? 'active' : ''}`}>
                                {isDone ? '✓' : isActive ? '●' : ''}
                            </div>
                            <span className={`timeline-label ${isDone ? 'done' : ''} ${isActive ? 'active' : ''}`}>
                                {LABELS[step]}
                            </span>
                        </div>
                        {i < STEPS.length - 1 && (
                            <div className={`timeline-line ${isDone ? 'done' : ''}`} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

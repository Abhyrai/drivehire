import { useState, useEffect } from 'react';

export default function MaintenanceScreen({ message }) {
    const [dots, setDots] = useState('');
    const [gearAngle, setGearAngle] = useState(0);

    // Animated dots
    useEffect(() => {
        const interval = setInterval(() => {
            setDots(prev => prev.length >= 3 ? '' : prev + '.');
        }, 500);
        return () => clearInterval(interval);
    }, []);

    // Gear rotation
    useEffect(() => {
        const interval = setInterval(() => {
            setGearAngle(prev => prev + 2);
        }, 50);
        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 99999,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
            fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
            overflow: 'hidden',
            color: '#fff'
        }}>
            {/* Animated background particles */}
            <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', opacity: 0.15 }}>
                {[...Array(20)].map((_, i) => (
                    <div key={i} style={{
                        position: 'absolute',
                        width: `${Math.random() * 6 + 2}px`,
                        height: `${Math.random() * 6 + 2}px`,
                        background: '#fff',
                        borderRadius: '50%',
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animation: `maintenanceFloat ${Math.random() * 6 + 4}s ease-in-out infinite`,
                        animationDelay: `${Math.random() * 4}s`
                    }} />
                ))}
            </div>

            {/* Glowing backdrop circle */}
            <div style={{
                position: 'absolute',
                width: '400px', height: '400px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255,107,53,0.15) 0%, transparent 70%)',
                filter: 'blur(40px)',
                animation: 'maintenancePulse 3s ease-in-out infinite'
            }} />

            {/* Main content card */}
            <div style={{
                position: 'relative',
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRadius: '24px',
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '48px 40px',
                maxWidth: '480px',
                width: '90%',
                textAlign: 'center',
                boxShadow: '0 25px 50px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
            }}>
                {/* Animated gear icon */}
                <div style={{
                    width: '100px', height: '100px',
                    margin: '0 auto 24px',
                    position: 'relative',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <svg width="90" height="90" viewBox="0 0 24 24" fill="none" stroke="rgba(255,107,53,0.9)" strokeWidth="1.5"
                        style={{ transform: `rotate(${gearAngle}deg)`, transition: 'none' }}>
                        <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                </div>

                {/* Title */}
                <h1 style={{
                    fontSize: '28px', fontWeight: 800,
                    marginBottom: '8px',
                    background: 'linear-gradient(135deg, #FF6B35, #FFD700)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '-0.5px'
                }}>
                    Maintenance Break
                </h1>

                {/* Subtitle */}
                <p style={{
                    fontSize: '16px', color: 'rgba(255,255,255,0.7)',
                    marginBottom: '28px', lineHeight: 1.6
                }}>
                    {message || "Our engineers are working hard to make DriveHire even better. We'll be back shortly!"}
                </p>

                {/* Progress-like bar */}
                <div style={{
                    width: '100%', height: '6px',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '3px',
                    overflow: 'hidden',
                    marginBottom: '20px'
                }}>
                    <div style={{
                        height: '100%',
                        background: 'linear-gradient(90deg, #FF6B35, #FFD700, #FF6B35)',
                        backgroundSize: '200% 100%',
                        borderRadius: '3px',
                        animation: 'maintenanceProgress 2s linear infinite'
                    }} />
                </div>

                {/* Loading text */}
                <p style={{
                    fontSize: '14px',
                    color: 'rgba(255,255,255,0.5)',
                    fontWeight: 500,
                    letterSpacing: '2px',
                    textTransform: 'uppercase'
                }}>
                    Updating{dots}
                </p>

                {/* Fun tips section */}
                <div style={{
                    marginTop: '28px',
                    padding: '16px',
                    background: 'rgba(255,107,53,0.08)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,107,53,0.15)'
                }}>
                    <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', margin: 0 }}>
                        💡 <strong style={{ color: 'rgba(255,255,255,0.8)' }}>Did you know?</strong><br />
                        DriveHire connects you with {'>'}500 verified drivers across India. Stay tuned!
                    </p>
                </div>
            </div>

            {/* Footer branding */}
            <div style={{
                position: 'absolute', bottom: '24px',
                display: 'flex', alignItems: 'center', gap: '8px',
                color: 'rgba(255,255,255,0.3)', fontSize: '14px'
            }}>
                <span style={{ fontSize: '20px' }}>🚗</span>
                DriveHire — We'll be right back
            </div>

            {/* CSS Animations */}
            <style>{`
                @keyframes maintenanceFloat {
                    0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
                    50% { transform: translateY(-30px) scale(1.5); opacity: 0.8; }
                }
                @keyframes maintenancePulse {
                    0%, 100% { transform: scale(1); opacity: 0.4; }
                    50% { transform: scale(1.1); opacity: 0.7; }
                }
                @keyframes maintenanceProgress {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
            `}</style>
        </div>
    );
}

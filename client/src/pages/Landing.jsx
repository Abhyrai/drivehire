import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FiShield, FiClock, FiStar, FiMapPin, FiDollarSign, FiUsers } from 'react-icons/fi';

export default function Landing() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleGetStarted = () => {
        if (user) {
            if (user.role === 'admin') navigate('/admin');
            else if (user.role === 'driver') navigate('/driver');
            else navigate('/customer');
        } else {
            navigate('/register');
        }
    };

    return (
        <div className="landing-page">
            {/* Navbar */}
            <nav className="navbar">
                <div className="logo">
                    <span>🚗</span> DriveHire
                </div>
                <div className="nav-links">
                    {user ? (
                        <>
                            <a href="#" onClick={handleGetStarted}>Dashboard</a>
                        </>
                    ) : (
                        <>
                            <a href="#features">Features</a>
                            <a href="#how-it-works">How It Works</a>
                            <a style={{ cursor: 'pointer' }} onClick={() => navigate('/about')}>About</a>
                            <a style={{ cursor: 'pointer' }} onClick={() => navigate('/faq')}>FAQ</a>
                            <button className="btn btn-primary btn-sm" onClick={() => navigate('/login')}>Sign In</button>
                        </>
                    )}
                </div>
            </nav>

            {/* Hero */}
            <section className="hero-section">
                <div className="container">
                    <div className="hero-content animate-in">
                        <h1>
                            Hire a <span className="gradient-text">Professional Driver</span> for Your Vehicle
                        </h1>
                        <p>
                            Own a car but don't want to drive? Whether you're tired, don't have a license,
                            or simply prefer a professional — DriveHire connects you with verified drivers
                            on your schedule. Hire a driver monthly and enjoy hassle-free commutes.
                        </p>
                        <div className="hero-actions">
                            <button className="btn btn-primary btn-lg" onClick={handleGetStarted}>
                                Get Started Free →
                            </button>
                            <button className="btn btn-secondary btn-lg" onClick={() => navigate('/register')}>
                                Become a Driver
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section id="features" className="container" style={{ paddingBottom: '4rem' }}>
                <div className="text-center" style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: 'var(--font-3xl)', fontWeight: 800 }}>Why Choose DriveHire?</h2>
                    <p className="text-muted" style={{ marginTop: '0.5rem' }}>Everything you need to hire a safe, reliable driver</p>
                </div>
                <div className="features-grid">
                    {[
                        { icon: <FiShield />, title: 'Verified Drivers', desc: 'Every driver is background-checked and documents verified by our admin team.', color: 'var(--primary)' },
                        { icon: <FiClock />, title: 'Monthly Hiring', desc: 'Hire a verified driver on a monthly basis. Your personal driver, always available when you need them.', color: 'var(--accent)' },
                        { icon: <FiStar />, title: 'Ratings & Reviews', desc: 'Read real reviews from other vehicle owners before choosing your driver.', color: 'var(--warning)' },
                        { icon: <FiMapPin />, title: 'Local Drivers', desc: 'Find drivers in your city who know your routes and neighborhoods well.', color: 'var(--success)' },
                        { icon: <FiDollarSign />, title: 'Transparent Pricing', desc: 'See estimated costs upfront. No hidden charges, no surge pricing.', color: 'var(--info)' },
                        { icon: <FiUsers />, title: 'Car & Bike Support', desc: 'Whether you own a car or bike, manual or automatic — we have drivers for you.', color: 'var(--danger)' }
                    ].map((f, i) => (
                        <div key={i} className="glass-card feature-card" style={{ animationDelay: `${i * 0.1}s` }}>
                            <div className="feature-icon" style={{ background: `${f.color}22`, color: f.color }}>
                                {f.icon}
                            </div>
                            <h3>{f.title}</h3>
                            <p>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* How It Works */}
            <section id="how-it-works" className="container" style={{ paddingBottom: '6rem' }}>
                <div className="text-center" style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: 'var(--font-3xl)', fontWeight: 800 }}>How It Works</h2>
                </div>
                <div className="features-grid" style={{ maxWidth: '900px', margin: '0 auto' }}>
                    {[
                        { step: '1', title: 'Sign Up & Add Vehicle', desc: 'Create an account, add your vehicle details — type, transmission, fuel.' },
                        { step: '2', title: 'Search & Book', desc: 'Search for verified drivers near you, check ratings, and book for your preferred duration.' },
                        { step: '3', title: 'Ride with Peace', desc: 'Your driver arrives, drives your vehicle. Rate them after the trip!' }
                    ].map((s, i) => (
                        <div key={i} className="glass-card text-center" style={{ padding: '2rem' }}>
                            <div style={{
                                width: 50, height: 50, borderRadius: '50%',
                                background: 'var(--gradient-primary)', display: 'flex',
                                alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 1rem', fontSize: '1.2rem', fontWeight: 800, color: 'white'
                            }}>
                                {s.step}
                            </div>
                            <h3 style={{ marginBottom: '0.5rem' }}>{s.title}</h3>
                            <p className="text-muted" style={{ fontSize: 'var(--font-sm)' }}>{s.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer style={{
                borderTop: '1px solid var(--border-color)',
                padding: '2rem',
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontSize: 'var(--font-sm)'
            }}>
                <p>© 2025 DriveHire — On-Demand Driver Hiring Platform. Built for BSc CS Final Year Project.</p>
            </footer>
        </div>
    );
}

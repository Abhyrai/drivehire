import { FiMapPin, FiShield, FiUsers, FiStar, FiTruck, FiClock } from 'react-icons/fi';
import { Link } from 'react-router-dom';

export default function About() {
    return (
        <div className="landing-page">
            <div className="container" style={{ paddingTop: 100, paddingBottom: 80 }}>
                {/* Hero */}
                <div style={{ textAlign: 'center', marginBottom: 64 }}>
                    <h1 style={{ fontSize: 'var(--font-4xl)', fontWeight: 700, fontFamily: 'var(--font-heading)', marginBottom: 16 }}>
                        About <span className="gradient-text">DriveHire</span>
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto', lineHeight: 1.7 }}>
                        India's trusted platform connecting customers with verified professional drivers.
                        Whether you need a chauffeur for daily commute, outstation trips, or special occasions — we've got you covered.
                    </p>
                </div>

                {/* Mission */}
                <div className="glass-card" style={{ maxWidth: 800, margin: '0 auto 48px', textAlign: 'center' }}>
                    <h2 style={{ marginBottom: 16, color: 'var(--primary)' }}>Our Mission</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                        To make professional driving services accessible, affordable, and safe for every Indian household.
                        We believe in empowering skilled drivers with fair earnings while providing customers with
                        a seamless, transparent booking experience.
                    </p>
                </div>

                {/* Why Us Grid */}
                <h2 style={{ textAlign: 'center', marginBottom: 32, fontFamily: 'var(--font-heading)' }}>Why Choose DriveHire?</h2>
                <div className="features-grid" style={{ maxWidth: 1000, margin: '0 auto 64px' }}>
                    {[
                        { icon: <FiShield />, title: 'Verified Drivers', desc: 'Every driver goes through background checks and document verification before being listed.' },
                        { icon: <FiStar />, title: 'Rated & Reviewed', desc: 'Transparent ratings and reviews from real customers help you choose the right driver.' },
                        { icon: <FiMapPin />, title: 'Pan-India Coverage', desc: 'Available across major Indian cities with drivers familiar with local routes and traffic.' },
                        { icon: <FiClock />, title: 'Flexible Durations', desc: 'Book drivers for hours, days, weeks, or months — whatever fits your schedule.' },
                        { icon: <FiTruck />, title: 'Any Vehicle Type', desc: 'Sedan, SUV, hatchback, or luxury — we have drivers experienced with all vehicle types.' },
                        { icon: <FiUsers />, title: 'Fair Pricing', desc: 'Transparent pricing with no hidden charges. Pay drivers their worth, without middlemen inflating costs.' },
                    ].map((f, i) => (
                        <div key={i} className="glass-card feature-card">
                            <div className="feature-icon" style={{ background: 'rgba(255, 107, 53, 0.12)', color: 'var(--primary)' }}>
                                {f.icon}
                            </div>
                            <h3>{f.title}</h3>
                            <p>{f.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Stats */}
                <div className="glass-card" style={{ maxWidth: 800, margin: '0 auto 48px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 32, textAlign: 'center' }}>
                        {[
                            { num: '10,000+', label: 'Active Drivers' },
                            { num: '50,000+', label: 'Happy Customers' },
                            { num: '100+', label: 'Cities Covered' },
                            { num: '4.8', label: 'Avg Rating' },
                        ].map((s, i) => (
                            <div key={i}>
                                <h3 style={{ fontSize: 'var(--font-3xl)', color: 'var(--primary)', fontWeight: 700 }}>{s.num}</h3>
                                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-sm)' }}>{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <div style={{ textAlign: 'center' }}>
                    <h2 style={{ marginBottom: 16, fontFamily: 'var(--font-heading)' }}>Ready to Get Started?</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Join thousands of satisfied customers across India.</p>
                    <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link to="/register" className="btn btn-primary btn-lg">Create Account</Link>
                        <Link to="/login" className="btn btn-secondary btn-lg">Sign In</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

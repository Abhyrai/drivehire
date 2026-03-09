import { Link } from 'react-router-dom';

export default function Privacy() {
    return (
        <div className="landing-page">
            <div className="container" style={{ paddingTop: 100, paddingBottom: 80, maxWidth: 800 }}>
                <h1 style={{ fontSize: 'var(--font-4xl)', fontWeight: 700, fontFamily: 'var(--font-heading)', marginBottom: 32 }}>
                    Privacy Policy
                </h1>

                <div className="glass-card" style={{ lineHeight: 1.8, color: 'var(--text-secondary)' }}>
                    <h2 style={{ color: 'var(--text-primary)', marginBottom: 16 }}>1. Information We Collect</h2>
                    <ul style={{ paddingLeft: 24 }}>
                        <li><strong>Personal Information:</strong> Name, email, phone number, city when you register.</li>
                        <li><strong>Driver Documents:</strong> Aadhaar, driving license, profile photo (for driver verification).</li>
                        <li><strong>Vehicle Information:</strong> Make, model, plate number, type added by customers.</li>
                        <li><strong>Booking Data:</strong> Pickup locations, booking dates, payment details.</li>
                        <li><strong>Usage Data:</strong> IP address, browser type, pages visited for analytics.</li>
                    </ul>

                    <h2 style={{ color: 'var(--text-primary)', margin: '24px 0 16px' }}>2. How We Use Your Information</h2>
                    <ul style={{ paddingLeft: 24 }}>
                        <li>To facilitate the connection between customers and drivers.</li>
                        <li>To process bookings, payments, and cancellations.</li>
                        <li>To verify driver identities and documents.</li>
                        <li>To send notifications about booking updates.</li>
                        <li>To improve our platform and user experience.</li>
                    </ul>

                    <h2 style={{ color: 'var(--text-primary)', margin: '24px 0 16px' }}>3. Data Security</h2>
                    <p>We implement industry-standard security measures including encrypted passwords (bcrypt), JWT-based authentication, and HTTPS encryption to protect your data. However, no method of electronic storage is 100% secure.</p>

                    <h2 style={{ color: 'var(--text-primary)', margin: '24px 0 16px' }}>4. Data Sharing</h2>
                    <p>We do not sell, trade, or share your personal information with third parties except:</p>
                    <ul style={{ paddingLeft: 24 }}>
                        <li>With the driver/customer you are booking with (limited booking details).</li>
                        <li>With payment processors for transaction processing.</li>
                        <li>When required by law or legal proceedings.</li>
                    </ul>

                    <h2 style={{ color: 'var(--text-primary)', margin: '24px 0 16px' }}>5. Your Rights</h2>
                    <ul style={{ paddingLeft: 24 }}>
                        <li>Access and update your personal information via your profile.</li>
                        <li>Request deletion of your account and associated data.</li>
                        <li>Opt out of promotional communications.</li>
                    </ul>

                    <h2 style={{ color: 'var(--text-primary)', margin: '24px 0 16px' }}>6. Cookies</h2>
                    <p>We use local storage and session tokens for authentication purposes. We do not use third-party tracking cookies.</p>

                    <h2 style={{ color: 'var(--text-primary)', margin: '24px 0 16px' }}>7. Contact Us</h2>
                    <p>For privacy-related queries: <strong>privacy@drivehire.in</strong></p>
                    <p style={{ marginTop: 16, fontStyle: 'italic' }}>Last updated: March 2026</p>
                </div>

                <div style={{ textAlign: 'center', marginTop: 32 }}>
                    <Link to="/" className="btn btn-secondary">← Back to Home</Link>
                </div>
            </div>
        </div>
    );
}

import { Link } from 'react-router-dom';

export default function Terms() {
    return (
        <div className="landing-page">
            <div className="container" style={{ paddingTop: 100, paddingBottom: 80, maxWidth: 800 }}>
                <h1 style={{ fontSize: 'var(--font-4xl)', fontWeight: 700, fontFamily: 'var(--font-heading)', marginBottom: 32 }}>
                    Terms & Conditions
                </h1>

                <div className="glass-card" style={{ lineHeight: 1.8, color: 'var(--text-secondary)' }}>
                    <h2 style={{ color: 'var(--text-primary)', marginBottom: 16 }}>1. Acceptance of Terms</h2>
                    <p>By accessing and using DriveHire, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions. If you do not agree, please do not use our platform.</p>

                    <h2 style={{ color: 'var(--text-primary)', margin: '24px 0 16px' }}>2. Services Description</h2>
                    <p>DriveHire is a platform that connects vehicle owners with verified professional drivers for monthly hiring. We facilitate the booking process, payments, and communication between customers and drivers.</p>

                    <h2 style={{ color: 'var(--text-primary)', margin: '24px 0 16px' }}>3. User Accounts</h2>
                    <ul style={{ paddingLeft: 24 }}>
                        <li>You must be at least 18 years old to create an account.</li>
                        <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
                        <li>All information provided must be accurate and up-to-date.</li>
                        <li>We reserve the right to suspend or terminate accounts that violate these terms.</li>
                    </ul>

                    <h2 style={{ color: 'var(--text-primary)', margin: '24px 0 16px' }}>4. Driver Verification</h2>
                    <p>All drivers on DriveHire undergo a verification process including document validation and background checks. However, DriveHire does not guarantee the accuracy of driver-provided information and recommends that customers exercise due diligence.</p>

                    <h2 style={{ color: 'var(--text-primary)', margin: '24px 0 16px' }}>5. Booking & Payments</h2>
                    <ul style={{ paddingLeft: 24 }}>
                        <li>Bookings are subject to driver availability and acceptance.</li>
                        <li>Pricing is determined by vehicle type, duration, and the driver's experience.</li>
                        <li>Cancellation penalties may apply as per the platform's pricing rules.</li>
                        <li>Payments can be made via cash or online methods as available.</li>
                    </ul>

                    <h2 style={{ color: 'var(--text-primary)', margin: '24px 0 16px' }}>6. Limitations of Liability</h2>
                    <p>DriveHire acts solely as an intermediary platform. We are not liable for any damages, losses, or disputes arising from the interaction between customers and drivers. Users assume all risks associated with using the service.</p>

                    <h2 style={{ color: 'var(--text-primary)', margin: '24px 0 16px' }}>7. Modifications</h2>
                    <p>DriveHire reserves the right to modify these terms at any time. Continued use of the platform after changes constitutes acceptance of the updated terms.</p>

                    <h2 style={{ color: 'var(--text-primary)', margin: '24px 0 16px' }}>8. Contact</h2>
                    <p>For any questions regarding these terms, please contact us at <strong>support@drivehire.in</strong></p>
                </div>

                <div style={{ textAlign: 'center', marginTop: 32 }}>
                    <Link to="/" className="btn btn-secondary">← Back to Home</Link>
                </div>
            </div>
        </div>
    );
}

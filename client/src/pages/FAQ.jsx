import { useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const FAQ_DATA = [
    { q: 'How do I book a driver?', a: 'Sign up as a customer, search for available drivers in your city, select your preferred driver, choose the vehicle type and duration, and confirm your booking. The driver will be notified immediately.' },
    { q: 'How are drivers verified?', a: 'All drivers undergo a thorough verification process including Aadhaar verification, driving license validation, police clearance, and reference checks. Only verified drivers appear in search results.' },
    { q: 'What payment methods are accepted?', a: 'Currently we support cash payment upon completion of the booking. Online payments via UPI, cards, and net banking are coming soon.' },
    { q: 'Can I cancel a booking?', a: 'Yes, you can cancel a booking from the "My Bookings" page. Cancellations before the booking start date are free. Cancellations after the start date may incur partial charges.' },
    { q: 'How is pricing calculated?', a: 'Pricing is based on the vehicle type, transmission type, duration, and city. Our pricing rules are transparent and set by the platform admin. You can see the exact amount before confirming.' },
    { q: 'Can I extend my booking?', a: 'Yes! Go to "My Bookings", find your active or confirmed booking, and click the "Extend" button. You can extend by 1 to 6 months. The additional amount is calculated automatically.' },
    { q: 'How do I rate and review a driver?', a: 'After a booking is completed, you can leave a review from the "My Bookings" page. Click the "Review" button on the completed booking and submit your rating and comments.' },
    { q: 'What if I face an issue with a driver?', a: 'You can raise a support ticket from the "Help & Support" section in your dashboard. Our team will review and resolve your issue within 24-48 hours.' },
    { q: 'How do I become a driver on DriveHire?', a: 'Register as a driver, complete your profile with experience details, upload your documents (Aadhaar, driving license, etc.), and wait for admin verification. Once approved, you\'ll start receiving job requests.' },
    { q: 'Is there a minimum booking duration?', a: 'Yes, the minimum booking duration varies by pricing rule but is typically 1 month for long-term hires. Daily and weekly options may be available depending on the city.' },
];

export default function FAQ() {
    const [open, setOpen] = useState(null);

    return (
        <div className="landing-page">
            <div className="container" style={{ paddingTop: 100, paddingBottom: 80, maxWidth: 800 }}>
                <div style={{ textAlign: 'center', marginBottom: 48 }}>
                    <h1 style={{ fontSize: 'var(--font-4xl)', fontWeight: 700, fontFamily: 'var(--font-heading)', marginBottom: 12 }}>
                        Frequently Asked Questions
                    </h1>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        Everything you need to know about DriveHire
                    </p>
                </div>

                <div>
                    {FAQ_DATA.map((faq, i) => (
                        <div key={i} className={`faq-item ${open === i ? 'open' : ''}`}>
                            <button className="faq-question" onClick={() => setOpen(open === i ? null : i)}>
                                <span>{faq.q}</span>
                                <FiChevronDown className="faq-chevron" />
                            </button>
                            <div className="faq-answer">
                                {faq.a}
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ textAlign: 'center', marginTop: 48 }}>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>Still have questions?</p>
                    <Link to="/login" className="btn btn-primary">Contact Support</Link>
                </div>
            </div>
        </div>
    );
}

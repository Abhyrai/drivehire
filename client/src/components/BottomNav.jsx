import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiHome, FiSearch, FiCalendar, FiUser, FiBriefcase, FiDollarSign, FiBarChart2, FiCheckCircle, FiMessageCircle } from 'react-icons/fi';

const tabs = {
    customer: [
        { path: '/customer', label: 'Home', icon: <FiHome /> },
        { path: '/customer/search', label: 'Find Driver', icon: <FiSearch /> },
        { path: '/customer/bookings', label: 'Bookings', icon: <FiCalendar /> },
        { path: '/customer/profile', label: 'Profile', icon: <FiUser /> },
    ],
    driver: [
        { path: '/driver', label: 'Home', icon: <FiHome /> },
        { path: '/driver/jobs', label: 'Jobs', icon: <FiBriefcase /> },
        { path: '/driver/earnings', label: 'Earnings', icon: <FiDollarSign /> },
        { path: '/driver/profile', label: 'Profile', icon: <FiUser /> },
    ],
    admin: [
        { path: '/admin', label: 'Dashboard', icon: <FiBarChart2 /> },
        { path: '/admin/drivers', label: 'Drivers', icon: <FiCheckCircle /> },
        { path: '/admin/bookings', label: 'Bookings', icon: <FiCalendar /> },
        { path: '/admin/support', label: 'Tickets', icon: <FiMessageCircle /> },
    ]
};

export default function BottomNav() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const items = tabs[user?.role] || [];

    if (!user || items.length === 0) return null;

    return (
        <nav className="bottom-nav">
            {items.map(item => {
                const active = location.pathname === item.path;
                return (
                    <button
                        key={item.path}
                        className={`bottom-nav-item ${active ? 'active' : ''}`}
                        onClick={() => navigate(item.path)}
                        aria-label={item.label}
                    >
                        <span className="bottom-nav-icon">{item.icon}</span>
                        <span className="bottom-nav-label">{item.label}</span>
                        {active && <span className="bottom-nav-dot" />}
                    </button>
                );
            })}
        </nav>
    );
}

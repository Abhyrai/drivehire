import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import NotificationBell from './NotificationBell';
import ScrollToTop from './ScrollToTop';
import {
    FiHome, FiSearch, FiCalendar, FiTruck, FiFileText, FiUser, FiLogOut, FiMenu, FiX,
    FiBriefcase, FiDollarSign, FiStar, FiUsers, FiCheckCircle, FiSettings, FiCreditCard,
    FiBarChart2, FiHelpCircle, FiSun, FiMoon, FiMessageCircle, FiHeart
} from 'react-icons/fi';

const navItems = {
    customer: [
        { path: '/customer', label: 'Dashboard', icon: <FiHome /> },
        { path: '/customer/search', label: 'Find Drivers', icon: <FiSearch /> },
        { path: '/customer/bookings', label: 'My Bookings', icon: <FiCalendar /> },
        { path: '/customer/calendar', label: 'Booking Calendar', icon: <FiCalendar /> },
        { path: '/customer/favorites', label: 'Favorites', icon: <FiHeart /> },
        { path: '/customer/vehicles', label: 'My Vehicles', icon: <FiTruck /> },
        { path: '/customer/invoices', label: 'Invoices', icon: <FiFileText /> },
        { path: '/customer/profile', label: 'Profile', icon: <FiUser /> },
        { path: '/customer/support', label: 'Help & Support', icon: <FiHelpCircle /> },
        { path: '/settings', label: 'Settings', icon: <FiSettings /> },
    ],
    driver: [
        { path: '/driver', label: 'Dashboard', icon: <FiHome /> },
        { path: '/driver/jobs', label: 'Job Requests', icon: <FiBriefcase /> },
        { path: '/driver/earnings', label: 'Earnings', icon: <FiDollarSign /> },
        { path: '/driver/reviews', label: 'My Reviews', icon: <FiStar /> },
        { path: '/driver/profile', label: 'Profile', icon: <FiUser /> },
        { path: '/driver/support', label: 'Help & Support', icon: <FiHelpCircle /> },
        { path: '/settings', label: 'Settings', icon: <FiSettings /> },
    ],
    admin: [
        { path: '/admin', label: 'Dashboard', icon: <FiBarChart2 /> },
        { path: '/admin/drivers', label: 'Manage Drivers', icon: <FiCheckCircle /> },
        { path: '/admin/users', label: 'Manage Users', icon: <FiUsers /> },
        { path: '/admin/bookings', label: 'All Bookings', icon: <FiCalendar /> },
        { path: '/admin/pricing', label: 'Pricing Rules', icon: <FiSettings /> },
        { path: '/admin/payments', label: 'Payments', icon: <FiCreditCard /> },
        { path: '/admin/support', label: 'Support Tickets', icon: <FiMessageCircle /> },
        { path: '/settings', label: 'Settings', icon: <FiSettings /> },
    ]
};

export default function DashboardLayout({ children }) {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const items = navItems[user?.role] || [];

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const closeSidebar = () => setSidebarOpen(false);

    return (
        <>
            {/* Navbar */}
            <nav className="navbar">
                <button className="btn btn-icon mobile-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}
                    style={{ marginRight: '0.5rem' }}>
                    {sidebarOpen ? <FiX /> : <FiMenu />}
                </button>
                <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                    <span>🚗</span> DriveHire
                </div>
                <div className="nav-links">
                    <button className="theme-toggle-btn" onClick={toggleTheme} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
                        {theme === 'dark' ? <FiSun /> : <FiMoon />}
                    </button>
                    <NotificationBell />
                    <div className="user-menu" onClick={handleLogout} title="Logout">
                        <div className="user-avatar">
                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <span style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)' }}>
                            {user?.name}
                        </span>
                        <FiLogOut style={{ color: 'var(--text-muted)' }} />
                    </div>
                </div>
            </nav>

            {/* Sidebar Overlay (mobile) */}
            <div className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`} onClick={closeSidebar} />

            {/* Sidebar */}
            <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="nav-section">
                    <span className="nav-section-title">{user?.role?.toUpperCase()} MENU</span>
                </div>
                {items.map((item) => (
                    <div key={item.path}
                        className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                        onClick={() => { navigate(item.path); closeSidebar(); }}>
                        <span className="icon">{item.icon}</span>
                        {item.label}
                    </div>
                ))}
                <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
                    <div className="nav-item" onClick={handleLogout}>
                        <span className="icon"><FiLogOut /></span>
                        Logout
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                {children}
            </main>

            <ScrollToTop />

            <style>{`
                .mobile-menu-btn { display: none; }
                @media (max-width: 768px) {
                    .mobile-menu-btn { display: flex !important; }
                }
            `}</style>
        </>
    );
}

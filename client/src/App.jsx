import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import ErrorBoundary from './components/ErrorBoundary';

// Pages
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import NotFound from './pages/NotFound';
import About from './pages/About';
import FAQ from './pages/FAQ';

// Customer
import CustomerDashboard from './pages/customer/Dashboard';
import SearchDrivers from './pages/customer/SearchDrivers';
import DriverProfile from './pages/customer/DriverProfile';
import MyBookings from './pages/customer/MyBookings';
import MyVehicles from './pages/customer/MyVehicles';
import Invoices from './pages/customer/Invoices';
import CustomerProfile from './pages/customer/Profile';
import BookingCalendar from './pages/customer/BookingCalendar';
import Favorites from './pages/customer/Favorites';

// Driver
import DriverDashboard from './pages/driver/Dashboard';
import JobRequests from './pages/driver/JobRequests';
import Earnings from './pages/driver/Earnings';
import DriverReviews from './pages/driver/Reviews';
import DriverProfilePage from './pages/driver/Profile';

// Admin
import AdminDashboard from './pages/admin/Dashboard';
import ManageDrivers from './pages/admin/ManageDrivers';
import ManageUsers from './pages/admin/ManageUsers';
import AllBookings from './pages/admin/AllBookings';
import PricingRules from './pages/admin/PricingRules';
import Payments from './pages/admin/Payments';
import SupportTickets from './pages/admin/SupportTickets';

// Shared
import HelpSupport from './pages/shared/HelpSupport';
import ChangePassword from './pages/shared/ChangePassword';
import Settings from './pages/shared/Settings';

// NProgress config
NProgress.configure({ showSpinner: false, trickleSpeed: 200 });

function RouteProgress() {
    const location = useLocation();
    useEffect(() => {
        window.scrollTo(0, 0);
        NProgress.start();
        const timer = setTimeout(() => NProgress.done(), 300);
        return () => { clearTimeout(timer); NProgress.done(); };
    }, [location.pathname]);
    return null;
}

function App() {
    return (
        <ErrorBoundary>
            <AuthProvider>
                <Router>
                    <RouteProgress />
                    <Routes>
                        {/* Public */}
                        <Route path="/" element={<Landing />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/faq" element={<FAQ />} />

                        {/* Customer Routes */}
                        <Route path="/customer" element={<ProtectedRoute roles={['customer']}><DashboardLayout><CustomerDashboard /></DashboardLayout></ProtectedRoute>} />
                        <Route path="/customer/search" element={<ProtectedRoute roles={['customer']}><DashboardLayout><SearchDrivers /></DashboardLayout></ProtectedRoute>} />
                        <Route path="/customer/driver/:id" element={<ProtectedRoute roles={['customer']}><DashboardLayout><DriverProfile /></DashboardLayout></ProtectedRoute>} />
                        <Route path="/customer/bookings" element={<ProtectedRoute roles={['customer']}><DashboardLayout><MyBookings /></DashboardLayout></ProtectedRoute>} />
                        <Route path="/customer/calendar" element={<ProtectedRoute roles={['customer']}><DashboardLayout><BookingCalendar /></DashboardLayout></ProtectedRoute>} />
                        <Route path="/customer/favorites" element={<ProtectedRoute roles={['customer']}><DashboardLayout><Favorites /></DashboardLayout></ProtectedRoute>} />
                        <Route path="/customer/vehicles" element={<ProtectedRoute roles={['customer']}><DashboardLayout><MyVehicles /></DashboardLayout></ProtectedRoute>} />
                        <Route path="/customer/invoices" element={<ProtectedRoute roles={['customer']}><DashboardLayout><Invoices /></DashboardLayout></ProtectedRoute>} />
                        <Route path="/customer/profile" element={<ProtectedRoute roles={['customer']}><DashboardLayout><CustomerProfile /></DashboardLayout></ProtectedRoute>} />
                        <Route path="/customer/support" element={<ProtectedRoute roles={['customer']}><DashboardLayout><HelpSupport /></DashboardLayout></ProtectedRoute>} />

                        {/* Driver Routes */}
                        <Route path="/driver" element={<ProtectedRoute roles={['driver']}><DashboardLayout><DriverDashboard /></DashboardLayout></ProtectedRoute>} />
                        <Route path="/driver/jobs" element={<ProtectedRoute roles={['driver']}><DashboardLayout><JobRequests /></DashboardLayout></ProtectedRoute>} />
                        <Route path="/driver/earnings" element={<ProtectedRoute roles={['driver']}><DashboardLayout><Earnings /></DashboardLayout></ProtectedRoute>} />
                        <Route path="/driver/reviews" element={<ProtectedRoute roles={['driver']}><DashboardLayout><DriverReviews /></DashboardLayout></ProtectedRoute>} />
                        <Route path="/driver/profile" element={<ProtectedRoute roles={['driver']}><DashboardLayout><DriverProfilePage /></DashboardLayout></ProtectedRoute>} />
                        <Route path="/driver/support" element={<ProtectedRoute roles={['driver']}><DashboardLayout><HelpSupport /></DashboardLayout></ProtectedRoute>} />

                        {/* Admin Routes */}
                        <Route path="/admin" element={<ProtectedRoute roles={['admin']}><DashboardLayout><AdminDashboard /></DashboardLayout></ProtectedRoute>} />
                        <Route path="/admin/drivers" element={<ProtectedRoute roles={['admin']}><DashboardLayout><ManageDrivers /></DashboardLayout></ProtectedRoute>} />
                        <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><DashboardLayout><ManageUsers /></DashboardLayout></ProtectedRoute>} />
                        <Route path="/admin/bookings" element={<ProtectedRoute roles={['admin']}><DashboardLayout><AllBookings /></DashboardLayout></ProtectedRoute>} />
                        <Route path="/admin/pricing" element={<ProtectedRoute roles={['admin']}><DashboardLayout><PricingRules /></DashboardLayout></ProtectedRoute>} />
                        <Route path="/admin/payments" element={<ProtectedRoute roles={['admin']}><DashboardLayout><Payments /></DashboardLayout></ProtectedRoute>} />
                        <Route path="/admin/support" element={<ProtectedRoute roles={['admin']}><DashboardLayout><SupportTickets /></DashboardLayout></ProtectedRoute>} />

                        {/* Shared */}
                        <Route path="/settings" element={<ProtectedRoute roles={['customer', 'driver', 'admin']}><DashboardLayout><Settings /></DashboardLayout></ProtectedRoute>} />
                        <Route path="/change-password" element={<ProtectedRoute roles={['customer', 'driver', 'admin']}><DashboardLayout><ChangePassword /></DashboardLayout></ProtectedRoute>} />

                        {/* 404 */}
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </Router>
                <ToastContainer position="top-right" theme="dark" autoClose={3000} />
            </AuthProvider>
        </ErrorBoundary>
    );
}

export default App;

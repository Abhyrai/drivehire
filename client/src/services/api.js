import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://drivehire-api.onrender.com/api',
    headers: { 'Content-Type': 'application/json' }
});

// Helper to get base server URL for images/uploads (strips /api)
export const getServerURL = () => {
    const base = import.meta.env.VITE_API_URL || 'https://drivehire-api.onrender.com/api';
    return base.replace(/\/api$/, '');
};

// Attach JWT on every request
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('drivehire_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Handle 503 maintenance responses
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 503 && error.response?.data?.maintenance) {
            // Store maintenance flag for UI to pick up
            window.__DRIVEHIRE_MAINTENANCE__ = true;
            window.__DRIVEHIRE_MAINTENANCE_MSG__ = error.response.data.message;
        }
        return Promise.reject(error);
    }
);

// Auth
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');
export const forgotPassword = (data) => API.post('/auth/forgot-password', data);
export const resetPassword = (data) => API.post('/auth/reset-password', data);
export const uploadAvatar = (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return API.put('/auth/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
};

// Customer
export const getProfile = () => API.get('/auth/me');
export const updateProfile = (data) => API.put('/customers/profile', data);
export const getVehicles = () => API.get('/customers/vehicles');
export const addVehicle = (data) => API.post('/customers/vehicles', data);
export const updateVehicle = (id, data) => API.put(`/customers/vehicles/${id}`, data);
export const deleteVehicle = (id) => API.delete(`/customers/vehicles/${id}`);
export const searchDrivers = (params) => API.get('/customers/search-drivers', { params });
export const getPriceEstimate = (params) => API.get('/customers/price-estimate', { params });
export const createBooking = (data) => API.post('/customers/bookings', data);
export const getCustomerBookings = (params) => API.get('/customers/bookings', { params });
export const cancelBooking = (id, data) => API.put(`/customers/bookings/${id}/cancel`, data);
export const createReview = (data) => API.post('/customers/reviews', data);
export const getInvoices = () => API.get('/customers/invoices');
export const getFavorites = () => API.get('/customers/favorites');
export const toggleFavoriteDriver = (driverId) => API.post(`/customers/favorites/${driverId}`);

// Driver
export const getDriverProfile = () => API.get('/drivers/profile');
export const updateDriverProfile = (data) => API.put('/drivers/profile', data);
export const uploadDocuments = (formData) => API.post('/drivers/documents', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const toggleOnline = () => API.put('/drivers/toggle-online');
export const getDriverJobs = (params) => API.get('/drivers/jobs', { params });
export const acceptJob = (id) => API.put(`/drivers/jobs/${id}/accept`);
export const rejectJob = (id, data) => API.put(`/drivers/jobs/${id}/reject`, data);
export const completeJob = (id) => API.put(`/drivers/jobs/${id}/complete`);
export const getEarnings = () => API.get('/drivers/earnings');
export const cancelJob = (id, data) => API.put(`/drivers/jobs/${id}/cancel`, data);
export const getDriverReviews = () => API.get('/drivers/reviews');
export const getDriverPublicProfile = (id) => API.get(`/drivers/${id}/public`);

// Admin
export const getAdminDashboard = () => API.get('/admin/dashboard');
export const getAdminDrivers = (params) => API.get('/admin/drivers', { params });
export const approveDriver = (id) => API.put(`/admin/drivers/${id}/approve`);
export const rejectDriver = (id) => API.put(`/admin/drivers/${id}/reject`);
export const getAdminUsers = () => API.get('/admin/users');
export const toggleBlockUser = (id) => API.put(`/admin/users/${id}/block`);
export const getAdminBookings = (params) => API.get('/admin/bookings', { params });
export const getPricingRules = () => API.get('/admin/pricing');
export const createPricingRule = (data) => API.post('/admin/pricing', data);
export const updatePricingRule = (id, data) => API.put(`/admin/pricing/${id}`, data);
export const deletePricingRule = (id) => API.delete(`/admin/pricing/${id}`);
export const getAdminPayments = () => API.get('/admin/payments');
export const getDriverDocuments = (id) => API.get(`/admin/drivers/${id}/documents`);
export const verifyDriverDocuments = (id, data) => API.put(`/admin/drivers/${id}/verify`, data);
export const adminCancelBooking = (id, data) => API.put(`/admin/bookings/${id}/cancel`, data);
export const extendBooking = (id, data) => API.put(`/customers/bookings/${id}/extend`, data);
export const initiatePayment = (id, data) => API.post(`/customers/bookings/${id}/pay`, data);
export const confirmPayment = (id, data) => API.post(`/customers/bookings/${id}/confirm-payment`, data);

// Support Tickets
export const createTicket = (data) => API.post('/support', data);
export const getMyTickets = () => API.get('/support/my-tickets');
export const getAllTickets = (params) => API.get('/support/all', { params });
export const replyToTicket = (id, data) => API.put(`/support/${id}/reply`, data);
export const updateTicketStatus = (id, data) => API.put(`/support/${id}/status`, data);
export const deleteTicket = (id) => API.delete(`/support/${id}`);

// Quick Messages
export const getMessageTemplates = () => API.get('/messages/templates');
export const sendQuickMessage = (bookingId, data) => API.post(`/messages/${bookingId}`, data);
export const getBookingMessages = (bookingId) => API.get(`/messages/${bookingId}`);

// Notifications
export const getNotifications = () => API.get('/notifications');
export const markNotificationRead = (id) => API.put(`/notifications/${id}/read`);
export const markAllNotificationsRead = () => API.put('/notifications/read-all');

// Auth
export const changePassword = (data) => API.put('/auth/change-password', data);

// Maintenance Mode (admin)
export const getMaintenanceStatus = () => API.get('/admin/maintenance');
export const toggleMaintenance = (data) => API.put('/admin/maintenance', data);

export default API;

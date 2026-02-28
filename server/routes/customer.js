const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const c = require('../controllers/customerController');

router.use(protect);
router.use(authorize('customer'));

router.route('/profile').get(c.getProfile).put(c.updateProfile);
router.route('/vehicles').get(c.getVehicles).post(c.addVehicle);
router.route('/vehicles/:id').put(c.updateVehicle).delete(c.deleteVehicle);
router.get('/search-drivers', c.searchDrivers);
router.get('/price-estimate', c.getPriceEstimate);
router.route('/bookings').get(c.getBookings).post(c.createBooking);
router.put('/bookings/:id/cancel', c.cancelBooking);
router.post('/bookings/:id/pay', c.initiatePayment);
router.post('/bookings/:id/confirm-payment', c.confirmPayment);
router.put('/bookings/:id/extend', c.extendBooking);
router.post('/reviews', c.createReview);
router.get('/invoices', c.getInvoices);
router.get('/favorites', c.getFavorites);
router.post('/favorites/:driverId', c.toggleFavorite);

module.exports = router;

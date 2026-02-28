const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const a = require('../controllers/adminController');

router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', a.getDashboard);
router.get('/drivers', a.getDrivers);
router.put('/drivers/:id/approve', a.approveDriver);
router.put('/drivers/:id/reject', a.rejectDriver);
router.get('/drivers/:id/documents', a.getDriverDocuments);
router.put('/drivers/:id/verify', a.verifyDriver);
router.get('/users', a.getUsers);
router.put('/users/:id/block', a.toggleBlockUser);
router.get('/bookings', a.getAllBookings);
router.route('/pricing').get(a.getPricingRules).post(a.createPricingRule);
router.route('/pricing/:id').put(a.updatePricingRule).delete(a.deletePricingRule);
router.get('/payments', a.getPayments);
router.put('/bookings/:id/cancel', a.cancelBooking);
router.route('/maintenance').get(a.getMaintenanceStatus).put(a.toggleMaintenance);

module.exports = router;

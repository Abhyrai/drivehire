const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { uploadDocuments } = require('../utils/cloudinary');
const d = require('../controllers/driverController');

// Public route — view any driver's profile
router.get('/:id/public', protect, d.getPublicProfile);

// Protected driver-only routes
router.use(protect);
router.use(authorize('driver'));

router.route('/profile').get(d.getProfile).put(d.updateProfile);
router.post('/documents', uploadDocuments.fields([
    { name: 'licenseImage', maxCount: 1 },
    { name: 'idProofImage', maxCount: 1 },
    { name: 'aadhaarImage', maxCount: 1 }
]), d.uploadDocuments);
router.put('/toggle-online', d.toggleOnline);
router.get('/jobs', d.getJobs);
router.put('/jobs/:id/accept', d.acceptJob);
router.put('/jobs/:id/reject', d.rejectJob);
router.put('/jobs/:id/cancel', d.cancelJob);
router.put('/jobs/:id/complete', d.completeJob);
router.get('/earnings', d.getEarnings);
router.get('/reviews', d.getReviews);

module.exports = router;

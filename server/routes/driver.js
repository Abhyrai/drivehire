const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect, authorize } = require('../middleware/auth');
const d = require('../controllers/driverController');

// Multer config for document uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|pdf/;
        const ext = allowed.test(path.extname(file.originalname).toLowerCase());
        const mime = allowed.test(file.mimetype);
        if (ext && mime) cb(null, true);
        else cb(new Error('Only JPEG, PNG, and PDF files are allowed'));
    }
});

// Public route — view any driver's profile
router.get('/:id/public', protect, d.getPublicProfile);

// Protected driver-only routes
router.use(protect);
router.use(authorize('driver'));

router.route('/profile').get(d.getProfile).put(d.updateProfile);
router.post('/documents', upload.fields([
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

const express = require('express');
const router = express.Router();
const { register, login, getMe, forgotPassword, resetPassword, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { uploadAvatar } = require('../utils/cloudinary');
const User = require('../models/User');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.put('/change-password', protect, changePassword);

// Avatar upload — Cloudinary
router.put('/avatar', protect, uploadAvatar.single('avatar'), async (req, res, next) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
        const avatarUrl = req.file.path;
        const user = await User.findByIdAndUpdate(req.user._id, { avatar: avatarUrl }, { new: true }).select('-password');
        res.json({ success: true, user, avatar: avatarUrl });
    } catch (error) { next(error); }
});

module.exports = router;

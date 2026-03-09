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

// Delete Account
router.delete('/delete-account', protect, async (req, res, next) => {
    try {
        const { password } = req.body;
        if (!password) return res.status(400).json({ success: false, message: 'Password is required to delete account' });

        const user = await User.findById(req.user._id).select('+password');
        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(401).json({ success: false, message: 'Incorrect password' });

        // Delete associated driver profile if exists
        const Driver = require('../models/Driver');
        await Driver.deleteOne({ userId: user._id });

        // Delete associated vehicles, bookings, reviews, etc.
        const Vehicle = require('../models/Vehicle');
        const Favorite = require('../models/Favorite');
        await Vehicle.deleteMany({ ownerId: user._id });
        await Favorite.deleteMany({ userId: user._id });

        // Delete user
        await User.findByIdAndDelete(user._id);

        res.json({ success: true, message: 'Account deleted successfully' });
    } catch (error) { next(error); }
});

module.exports = router;

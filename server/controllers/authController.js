const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Driver = require('../models/Driver');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
};

// POST /api/auth/register
exports.register = async (req, res, next) => {
    try {
        const { name, email, password, phone, role, city } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email already registered' });
        }

        const user = await User.create({
            name, email, password, phone, city,
            role: role === 'driver' ? 'driver' : 'customer'
        });

        // If driver role, create driver profile stub
        if (user.role === 'driver') {
            const { licenseNumber, experience, vehicleTypes, transmissions, languages } = req.body;
            await Driver.create({
                userId: user._id,
                licenseNumber: licenseNumber || '',
                experience: experience || 0,
                vehicleTypes: vehicleTypes || ['car'],
                transmissions: transmissions || ['manual'],
                languages: languages || ['English'],
                city: city || ''
            });
        }

        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                city: user.city
            }
        });
    } catch (error) {
        next(error);
    }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        if (user.isBlocked) {
            return res.status(403).json({ success: false, message: 'Account is blocked. Contact admin.' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const token = generateToken(user._id);

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                city: user.city,
                avatar: user.avatar
            }
        });
    } catch (error) {
        next(error);
    }
};

// GET /api/auth/me
exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        let driverProfile = null;

        if (user.role === 'driver') {
            driverProfile = await Driver.findOne({ userId: user._id });
        }

        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                city: user.city,
                avatar: user.avatar,
                isVerified: user.isVerified,
                driverProfile
            }
        });
    } catch (error) {
        next(error);
    }
};

// POST /api/auth/forgot-password
exports.forgotPassword = async (req, res, next) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'No account with that email' });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 min
        await user.save({ validateBeforeSave: false });

        // In production, send email. For demo, return token.
        res.json({
            success: true,
            message: 'Password reset token generated',
            resetToken // Remove in production
        });
    } catch (error) {
        next(error);
    }
};

// POST /api/auth/reset-password
exports.resetPassword = async (req, res, next) => {
    try {
        const hashedToken = crypto.createHash('sha256').update(req.body.token).digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid or expired token' });
        }

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        const token = generateToken(user._id);
        res.json({ success: true, token, message: 'Password reset successful' });
    } catch (error) {
        next(error);
    }
};

// PUT /api/auth/change-password
exports.changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: 'Current and new password are required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
        }

        const user = await User.findById(req.user._id).select('+password');
        const isMatch = await user.comparePassword(currentPassword);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Current password is incorrect' });
        }

        user.password = newPassword;
        await user.save();

        const token = generateToken(user._id);
        res.json({ success: true, token, message: 'Password changed successfully' });
    } catch (error) {
        next(error);
    }
};

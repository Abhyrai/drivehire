const User = require('../models/User');
const Driver = require('../models/Driver');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const PricingRule = require('../models/PricingRule');
const { createNotification } = require('./notificationController');
const { setMaintenance, getMaintenance } = require('../middleware/maintenance');

// GET /api/admin/dashboard
exports.getDashboard = async (req, res, next) => {
    try {
        const totalUsers = await User.countDocuments({ role: 'customer' });
        const totalDrivers = await Driver.countDocuments();
        const activeDrivers = await Driver.countDocuments({ isApproved: 'approved', isOnline: true });
        const pendingDrivers = await Driver.countDocuments({ isApproved: 'pending' });
        const totalBookings = await Booking.countDocuments();
        const activeBookings = await Booking.countDocuments({ status: { $in: ['pending', 'confirmed', 'active'] } });
        const completedBookings = await Booking.countDocuments({ status: 'completed' });
        const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });

        const totalRevenue = await Payment.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        // Recent bookings
        const recentBookings = await Booking.find()
            .populate('customerId', 'name email')
            .populate('vehicleId', 'type make model')
            .populate({
                path: 'driverId',
                select: 'userId rating',
                populate: { path: 'userId', select: 'name' }
            })
            .sort('-createdAt')
            .limit(10);

        // Map driver names for easy frontend access
        const mappedBookings = recentBookings.map(b => {
            const obj = b.toObject();
            obj.driverName = b.driverId?.userId?.name || '—';
            return obj;
        });

        res.json({
            success: true,
            stats: {
                totalUsers,
                totalDrivers,
                activeDrivers,
                pendingDrivers,
                totalBookings,
                activeBookings,
                completedBookings,
                cancelledBookings,
                pendingBookings: await Booking.countDocuments({ status: 'pending' }),
                confirmedBookings: await Booking.countDocuments({ status: 'confirmed' }),
                totalRevenue: totalRevenue[0]?.total || 0
            },
            recentBookings: mappedBookings
        });
    } catch (error) { next(error); }
};

// GET /api/admin/drivers
exports.getDrivers = async (req, res, next) => {
    try {
        const { status } = req.query;
        const query = {};
        if (status) query.isApproved = status;

        const drivers = await Driver.find(query)
            .populate('userId', 'name email phone city avatar isBlocked')
            .sort('-createdAt');

        res.json({ success: true, count: drivers.length, drivers });
    } catch (error) { next(error); }
};

// PUT /api/admin/drivers/:id/approve
exports.approveDriver = async (req, res, next) => {
    try {
        const driver = await Driver.findByIdAndUpdate(
            req.params.id,
            { isApproved: 'approved' },
            { new: true }
        ).populate('userId', 'name email');

        if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });
        res.json({ success: true, message: 'Driver approved', driver });
    } catch (error) { next(error); }
};

// PUT /api/admin/drivers/:id/reject
exports.rejectDriver = async (req, res, next) => {
    try {
        const driver = await Driver.findByIdAndUpdate(
            req.params.id,
            { isApproved: 'rejected' },
            { new: true }
        ).populate('userId', 'name email');

        if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });
        res.json({ success: true, message: 'Driver rejected', driver });
    } catch (error) { next(error); }
};

// GET /api/admin/drivers/:id/documents — view driver's uploaded documents
exports.getDriverDocuments = async (req, res, next) => {
    try {
        const driver = await Driver.findById(req.params.id)
            .populate('userId', 'name email phone');
        if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });

        res.json({
            success: true,
            driver: {
                _id: driver._id,
                name: driver.userId?.name,
                email: driver.userId?.email,
                phone: driver.userId?.phone,
                licenseNumber: driver.licenseNumber,
                licenseImage: driver.licenseImage,
                aadhaarNumber: driver.aadhaarNumber,
                aadhaarImage: driver.aadhaarImage,
                idProofImage: driver.idProofImage,
                documentStatus: driver.documentStatus,
                verificationRemarks: driver.verificationRemarks,
                verifiedAt: driver.verifiedAt,
                experience: driver.experience,
                city: driver.city
            }
        });
    } catch (error) { next(error); }
};

// PUT /api/admin/drivers/:id/verify — approve or reject documents
exports.verifyDriver = async (req, res, next) => {
    try {
        const { action, remarks } = req.body; // action: 'verify' or 'reject'

        if (!['verify', 'reject'].includes(action)) {
            return res.status(400).json({ success: false, message: 'Action must be verify or reject' });
        }

        // Fetch driver first to check current status
        const currentDriver = await Driver.findById(req.params.id);
        if (!currentDriver) return res.status(404).json({ success: false, message: 'Driver not found' });

        // Guard: can only reject if docs are pending_review (not already rejected)
        if (action === 'reject' && currentDriver.documentStatus === 'rejected') {
            return res.status(400).json({
                success: false,
                message: 'Documents are already rejected. Wait for the driver to re-upload new documents before reviewing again.'
            });
        }

        // Guard: can only verify/reject docs that are pending_review
        if (currentDriver.documentStatus !== 'pending_review') {
            if (action === 'verify' && currentDriver.documentStatus === 'verified') {
                return res.status(400).json({ success: false, message: 'Documents are already verified' });
            }
            if (currentDriver.documentStatus === 'not_uploaded') {
                return res.status(400).json({ success: false, message: 'Driver has not uploaded any documents yet' });
            }
        }

        const updates = {};
        if (action === 'verify') {
            updates.documentStatus = 'verified';
            updates.verifiedAt = new Date();
            updates.verificationRemarks = remarks || 'Documents verified successfully';
            updates.isApproved = 'approved'; // also approve the driver
        } else {
            updates.documentStatus = 'rejected';
            updates.verificationRemarks = remarks || 'Documents rejected';
        }

        const driver = await Driver.findByIdAndUpdate(req.params.id, updates, { new: true })
            .populate('userId', 'name email');

        // Notify the driver
        createNotification(
            driver.userId._id,
            action === 'verify' ? 'docs_verified' : 'docs_rejected',
            action === 'verify' ? 'Documents Verified! ✅' : 'Documents Rejected ❌',
            action === 'verify'
                ? 'Your documents have been verified. You can now go online and accept jobs!'
                : `Your documents were rejected. Reason: ${updates.verificationRemarks}. Please re-upload.`,
            '/driver/profile'
        );

        res.json({
            success: true,
            message: action === 'verify' ? 'Driver documents verified & approved' : 'Driver documents rejected',
            driver
        });
    } catch (error) { next(error); }
};

// GET /api/admin/users
exports.getUsers = async (req, res, next) => {
    try {
        const users = await User.find({ role: { $ne: 'admin' } })
            .select('-password')
            .sort('-createdAt');
        res.json({ success: true, count: users.length, users });
    } catch (error) { next(error); }
};

// PUT /api/admin/users/:id/block
exports.toggleBlockUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        user.isBlocked = !user.isBlocked;
        await user.save({ validateBeforeSave: false });

        res.json({ success: true, message: user.isBlocked ? 'User blocked' : 'User unblocked', user });
    } catch (error) { next(error); }
};

// GET /api/admin/bookings
exports.getAllBookings = async (req, res, next) => {
    try {
        const { status } = req.query;
        const query = {};
        if (status) query.status = status;

        const bookings = await Booking.find(query)
            .populate('customerId', 'name email phone')
            .populate('vehicleId', 'type make model plateNumber')
            .sort('-createdAt');

        await Driver.populate(bookings, { path: 'driverId', select: 'userId rating' });

        res.json({ success: true, count: bookings.length, bookings });
    } catch (error) { next(error); }
};

// CRUD Pricing Rules
exports.getPricingRules = async (req, res, next) => {
    try {
        const rules = await PricingRule.find().sort('vehicleType durationType');
        res.json({ success: true, rules });
    } catch (error) { next(error); }
};

exports.createPricingRule = async (req, res, next) => {
    try {
        const rule = await PricingRule.create(req.body);
        res.status(201).json({ success: true, rule });
    } catch (error) { next(error); }
};

exports.updatePricingRule = async (req, res, next) => {
    try {
        const rule = await PricingRule.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!rule) return res.status(404).json({ success: false, message: 'Pricing rule not found' });
        res.json({ success: true, rule });
    } catch (error) { next(error); }
};

exports.deletePricingRule = async (req, res, next) => {
    try {
        const rule = await PricingRule.findByIdAndDelete(req.params.id);
        if (!rule) return res.status(404).json({ success: false, message: 'Pricing rule not found' });
        res.json({ success: true, message: 'Pricing rule deleted' });
    } catch (error) { next(error); }
};

// GET /api/admin/payments
exports.getPayments = async (req, res, next) => {
    try {
        const payments = await Payment.find()
            .populate('bookingId', 'startTime endTime durationType status')
            .populate('customerId', 'name email')
            .sort('-createdAt');

        res.json({ success: true, count: payments.length, payments });
    } catch (error) { next(error); }
};

// PUT /api/admin/bookings/:id/cancel — admin cancels any booking
exports.cancelBooking = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

        if (booking.status === 'cancelled' || booking.status === 'completed') {
            return res.status(400).json({ success: false, message: `Cannot cancel a ${booking.status} booking` });
        }

        booking.status = 'cancelled';
        booking.cancellationReason = req.body.reason || 'Cancelled by admin';
        booking.cancelledBy = 'admin';
        await booking.save();

        // Notify both parties
        const { createNotification } = require('./notificationController');
        createNotification(booking.customerId, 'booking_cancelled', 'Booking Cancelled by Admin ⚠️',
            `Your booking was cancelled by the admin. Reason: ${booking.cancellationReason}`, '/customer/bookings');

        const driverDoc = await Driver.findById(booking.driverId);
        if (driverDoc) {
            createNotification(driverDoc.userId, 'booking_cancelled', 'Booking Cancelled by Admin ⚠️',
                `A booking was cancelled by the admin. Reason: ${booking.cancellationReason}`, '/driver/jobs');
        }

        res.json({ success: true, message: 'Booking cancelled', booking });
    } catch (error) { next(error); }
};

// ═══════════ MAINTENANCE MODE ═══════════

// GET /api/admin/maintenance
exports.getMaintenanceStatus = (req, res) => {
    res.json({ success: true, ...getMaintenance() });
};

// PUT /api/admin/maintenance
exports.toggleMaintenance = (req, res) => {
    const { enabled, message } = req.body;
    setMaintenance(!!enabled, message || undefined);
    const status = getMaintenance();
    res.json({ success: true, message: `Maintenance mode ${status.enabled ? 'ENABLED 🔧' : 'DISABLED ✅'}`, ...status });
};

const Driver = require('../models/Driver');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const Payment = require('../models/Payment');
const { createNotification } = require('./notificationController');

// GET /api/drivers/profile
exports.getProfile = async (req, res, next) => {
    try {
        const driver = await Driver.findOne({ userId: req.user._id })
            .populate('userId', 'name email phone avatar city');
        if (!driver) return res.status(404).json({ success: false, message: 'Driver profile not found' });
        res.json({ success: true, driver });
    } catch (error) { next(error); }
};

// PUT /api/drivers/profile
exports.updateProfile = async (req, res, next) => {
    try {
        const updates = {};
        const allowed = ['licenseNumber', 'experience', 'languages', 'vehicleTypes', 'transmissions', 'city', 'availableFrom', 'availableTo'];
        allowed.forEach(field => {
            if (req.body[field] !== undefined) updates[field] = req.body[field];
        });

        const driver = await Driver.findOneAndUpdate(
            { userId: req.user._id },
            updates,
            { new: true, runValidators: true }
        ).populate('userId', 'name email phone avatar city');

        if (!driver) return res.status(404).json({ success: false, message: 'Driver profile not found' });

        // Also update user name/phone if provided
        if (req.body.name || req.body.phone) {
            const userUpdates = {};
            if (req.body.name) userUpdates.name = req.body.name;
            if (req.body.phone) userUpdates.phone = req.body.phone;
            await User.findByIdAndUpdate(req.user._id, userUpdates);
        }

        res.json({ success: true, driver });
    } catch (error) { next(error); }
};

// POST /api/drivers/documents — upload Aadhaar + License images
exports.uploadDocuments = async (req, res, next) => {
    try {
        const updates = {};

        if (req.files?.licenseImage) {
            updates.licenseImage = '/uploads/' + req.files.licenseImage[0].filename;
        }
        if (req.files?.idProofImage) {
            updates.idProofImage = '/uploads/' + req.files.idProofImage[0].filename;
        }
        if (req.files?.aadhaarImage) {
            updates.aadhaarImage = '/uploads/' + req.files.aadhaarImage[0].filename;
        }

        // Save Aadhaar number if provided
        if (req.body.aadhaarNumber) {
            const aadhaar = req.body.aadhaarNumber.replace(/\s/g, '');
            if (!/^\d{12}$/.test(aadhaar)) {
                return res.status(400).json({ success: false, message: 'Aadhaar number must be 12 digits' });
            }
            updates.aadhaarNumber = aadhaar;
        }

        // Save license number if provided
        if (req.body.licenseNumber) {
            updates.licenseNumber = req.body.licenseNumber.trim();
        }

        // Auto-set status to pending_review if documents are uploaded
        const hasDocUploads = updates.licenseImage || updates.aadhaarImage;
        if (hasDocUploads) {
            updates.documentStatus = 'pending_review';
            updates.verificationRemarks = ''; // clear old remarks
        }

        const driver = await Driver.findOneAndUpdate(
            { userId: req.user._id },
            updates,
            { new: true }
        );

        if (!driver) return res.status(404).json({ success: false, message: 'Driver profile not found' });
        res.json({ success: true, driver, message: 'Documents uploaded — pending admin review' });
    } catch (error) { next(error); }
};

// PUT /api/drivers/toggle-online
exports.toggleOnline = async (req, res, next) => {
    try {
        const driver = await Driver.findOne({ userId: req.user._id });
        if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });

        if (driver.isApproved !== 'approved') {
            return res.status(400).json({ success: false, message: 'Profile not yet approved by admin' });
        }

        // Block going online if documents not verified
        if (driver.documentStatus !== 'verified') {
            return res.status(400).json({
                success: false,
                message: driver.documentStatus === 'not_uploaded'
                    ? 'Please upload your Aadhaar card and driving license first'
                    : driver.documentStatus === 'pending_review'
                        ? 'Your documents are pending admin review'
                        : 'Your documents were rejected. Please re-upload with correct documents'
            });
        }

        driver.isOnline = !driver.isOnline;
        driver.availability = driver.isOnline ? 'available' : 'offline';
        await driver.save();

        res.json({ success: true, isOnline: driver.isOnline });
    } catch (error) { next(error); }
};

// GET /api/drivers/jobs
exports.getJobs = async (req, res, next) => {
    try {
        const driver = await Driver.findOne({ userId: req.user._id });
        if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });

        const { status } = req.query;
        const query = { driverId: driver._id };
        if (status) query.status = status;

        const bookings = await Booking.find(query)
            .populate('customerId', 'name phone avatar city')
            .populate('vehicleId', 'type make model plateNumber transmission fuelType')
            .sort('-createdAt');

        res.json({ success: true, count: bookings.length, bookings });
    } catch (error) { next(error); }
};

// PUT /api/drivers/jobs/:id/accept
exports.acceptJob = async (req, res, next) => {
    try {
        const driver = await Driver.findOne({ userId: req.user._id });
        const booking = await Booking.findOne({ _id: req.params.id, driverId: driver._id, status: 'pending' });

        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found or already processed' });

        // If start date has already passed, go directly to 'active'
        const now = new Date();
        booking.status = new Date(booking.startTime) <= now ? 'active' : 'confirmed';
        await booking.save();

        // Notify customer
        createNotification(
            booking.customerId, 'booking_accepted',
            'Booking Confirmed! ✅',
            `Your driver has accepted the booking. ${booking.status === 'active' ? 'The job is now active!' : 'It will start on the scheduled date.'}`,
            '/customer/bookings'
        );

        res.json({ success: true, booking });
    } catch (error) { next(error); }
};

// PUT /api/drivers/jobs/:id/reject
exports.rejectJob = async (req, res, next) => {
    try {
        const driver = await Driver.findOne({ userId: req.user._id });
        const booking = await Booking.findOne({ _id: req.params.id, driverId: driver._id, status: 'pending' });

        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found or already processed' });

        booking.status = 'cancelled';
        booking.cancellationReason = req.body.reason || 'Rejected by driver';
        booking.cancelledBy = 'driver';
        await booking.save();

        createNotification(
            booking.customerId, 'booking_rejected',
            'Booking Declined ❌',
            `A driver has declined your booking request. You can search for another driver.`,
            '/customer/search'
        );

        res.json({ success: true, booking });
    } catch (error) { next(error); }
};

// PUT /api/drivers/jobs/:id/cancel — driver cancels a confirmed/active booking
exports.cancelJob = async (req, res, next) => {
    try {
        const driver = await Driver.findOne({ userId: req.user._id });
        const booking = await Booking.findOne({
            _id: req.params.id,
            driverId: driver._id,
            status: { $in: ['confirmed', 'active'] }
        });

        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

        booking.status = 'cancelled';
        booking.cancellationReason = req.body.reason || 'Cancelled by driver';
        booking.cancelledBy = 'driver';
        await booking.save();

        createNotification(
            booking.customerId, 'booking_cancelled',
            'Booking Cancelled ⚠️',
            `Your driver has cancelled the booking. Reason: ${booking.cancellationReason}`,
            '/customer/bookings'
        );

        res.json({ success: true, message: 'Booking cancelled', booking });
    } catch (error) { next(error); }
};

// PUT /api/drivers/jobs/:id/complete
exports.completeJob = async (req, res, next) => {
    try {
        const driver = await Driver.findOne({ userId: req.user._id });
        const booking = await Booking.findOne({
            _id: req.params.id,
            driverId: driver._id,
            status: { $in: ['confirmed', 'active'] }
        });

        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

        booking.status = 'completed';
        await booking.save();

        // Create payment record only if not already paid online
        const existingPayment = await Payment.findOne({ bookingId: booking._id, status: 'completed' });
        if (!existingPayment) {
            await Payment.create({
                bookingId: booking._id,
                customerId: booking.customerId,
                amount: booking.totalPrice,
                method: booking.paymentMethod || 'cash',
                status: 'completed'
            });
        }

        // Update driver stats
        driver.completedJobs += 1;
        driver.totalEarnings += booking.totalPrice;
        await driver.save();

        // Notify customer about completion
        createNotification(
            booking.customerId, 'booking_completed',
            'Job Completed! 🎉',
            `Your booking has been completed. Total: ₹${booking.totalPrice.toLocaleString()}. Please leave a review!`,
            '/customer/bookings'
        );

        res.json({ success: true, booking });
    } catch (error) { next(error); }
};

// GET /api/drivers/earnings
exports.getEarnings = async (req, res, next) => {
    try {
        const driver = await Driver.findOne({ userId: req.user._id });
        if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });

        const completedBookings = await Booking.find({ driverId: driver._id, status: 'completed' })
            .populate('vehicleId', 'type make model')
            .sort('-createdAt');

        const totalEarnings = completedBookings.reduce((sum, b) => sum + b.totalPrice, 0);

        res.json({
            success: true,
            totalEarnings,
            completedJobs: completedBookings.length,
            bookings: completedBookings
        });
    } catch (error) { next(error); }
};

// GET /api/drivers/reviews
exports.getReviews = async (req, res, next) => {
    try {
        const driver = await Driver.findOne({ userId: req.user._id });
        if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });

        const reviews = await Review.find({ driverId: driver._id })
            .populate('customerId', 'name avatar')
            .sort('-createdAt');

        res.json({ success: true, rating: driver.rating, totalReviews: driver.totalReviews, reviews });
    } catch (error) { next(error); }
};

// GET /api/drivers/:id/public — public profile for customers
exports.getPublicProfile = async (req, res, next) => {
    try {
        const driver = await Driver.findById(req.params.id)
            .populate('userId', 'name avatar city');
        if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });

        const reviews = await Review.find({ driverId: driver._id })
            .populate('customerId', 'name avatar')
            .sort('-createdAt')
            .limit(10);

        res.json({ success: true, driver, reviews });
    } catch (error) { next(error); }
};

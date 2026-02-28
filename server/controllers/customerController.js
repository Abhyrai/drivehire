const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Review = require('../models/Review');
const Favorite = require('../models/Favorite');
const { calculatePrice, calculateCancellationPenalty } = require('../services/pricingService');
const { createNotification } = require('./notificationController');

// GET /api/customers/profile
exports.getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        res.json({ success: true, user });
    } catch (error) { next(error); }
};

// PUT /api/customers/profile
exports.updateProfile = async (req, res, next) => {
    try {
        const { name, phone, city, avatar } = req.body;
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { name, phone, city, avatar },
            { new: true, runValidators: true }
        );
        res.json({ success: true, user });
    } catch (error) { next(error); }
};

// CRUD Vehicle
exports.getVehicles = async (req, res, next) => {
    try {
        const vehicles = await Vehicle.find({ ownerId: req.user._id }).sort('-createdAt');
        res.json({ success: true, vehicles });
    } catch (error) { next(error); }
};

exports.addVehicle = async (req, res, next) => {
    try {
        const vehicle = await Vehicle.create({ ...req.body, ownerId: req.user._id });
        res.status(201).json({ success: true, vehicle });
    } catch (error) { next(error); }
};

exports.updateVehicle = async (req, res, next) => {
    try {
        const vehicle = await Vehicle.findOneAndUpdate(
            { _id: req.params.id, ownerId: req.user._id },
            req.body,
            { new: true, runValidators: true }
        );
        if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });
        res.json({ success: true, vehicle });
    } catch (error) { next(error); }
};

exports.deleteVehicle = async (req, res, next) => {
    try {
        const vehicle = await Vehicle.findOneAndDelete({ _id: req.params.id, ownerId: req.user._id });
        if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });
        res.json({ success: true, message: 'Vehicle deleted' });
    } catch (error) { next(error); }
};

// GET /api/customers/search-drivers
exports.searchDrivers = async (req, res, next) => {
    try {
        const { city, vehicleType, transmission, minRating } = req.query;

        const query = { isApproved: 'approved', isOnline: true, documentStatus: 'verified' };
        if (city) query.city = new RegExp(city, 'i');
        if (vehicleType) query.vehicleTypes = vehicleType;
        if (transmission) query.transmissions = { $in: [transmission, 'both'] };
        if (minRating) query.rating = { $gte: Number(minRating) };

        const drivers = await Driver.find(query)
            .populate('userId', 'name email phone avatar city')
            .sort('-rating')
            .limit(50);

        res.json({ success: true, count: drivers.length, drivers });
    } catch (error) { next(error); }
};

// POST /api/customers/bookings
exports.createBooking = async (req, res, next) => {
    try {
        const { driverId, vehicleId, startTime, endTime, durationType, pickupLocation, notes, paymentMethod } = req.body;

        // Validate dates
        const start = new Date(startTime);
        const end = new Date(endTime);
        const now = new Date();

        if (start < now) {
            return res.status(400).json({ success: false, message: 'Start date cannot be in the past' });
        }

        const diffDays = (end - start) / (1000 * 60 * 60 * 24);
        if (diffDays < 30) {
            return res.status(400).json({ success: false, message: 'Minimum booking duration is 1 month (30 days)' });
        }

        // Validate vehicle ownership
        const vehicle = await Vehicle.findOne({ _id: vehicleId, ownerId: req.user._id });
        if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });

        // Validate driver
        const driver = await Driver.findById(driverId);
        if (!driver || driver.isApproved !== 'approved') {
            return res.status(400).json({ success: false, message: 'Driver not available' });
        }

        // Check for overlapping bookings for this driver
        const overlap = await Booking.findOne({
            driverId,
            status: { $in: ['pending', 'confirmed', 'active'] },
            startTime: { $lt: end },
            endTime: { $gt: start }
        });
        if (overlap) {
            return res.status(400).json({ success: false, message: 'Driver is already booked for this time period' });
        }

        // Validate payment method
        const validMethods = ['upi', 'card', 'netbanking', 'wallet', 'cash'];
        const method = validMethods.includes(paymentMethod) ? paymentMethod : 'cash';

        // Calculate price
        const totalPrice = await calculatePrice(vehicle.type, durationType, startTime, endTime, driver.experience);

        const booking = await Booking.create({
            customerId: req.user._id,
            driverId,
            vehicleId,
            startTime,
            endTime,
            durationType: 'monthly',
            totalPrice,
            pickupLocation,
            notes,
            paymentMethod: method,
            paymentStatus: 'unpaid',
            status: 'pending'
        });

        // Notify driver about new booking request
        createNotification(
            driver.userId, 'booking_new',
            'New Booking Request 🚗',
            `You have a new monthly booking request worth ₹${totalPrice.toLocaleString()}. Check your job requests!`,
            '/driver/jobs'
        );

        res.status(201).json({ success: true, booking });
    } catch (error) { next(error); }
};

// GET /api/customers/bookings
exports.getBookings = async (req, res, next) => {
    try {
        const { status } = req.query;
        const query = { customerId: req.user._id };
        if (status) query.status = status;

        const bookings = await Booking.find(query)
            .populate('driverId', 'userId rating experience')
            .populate('vehicleId', 'type make model plateNumber')
            .sort('-createdAt');

        // Populate driver user info
        await Driver.populate(bookings, { path: 'driverId.userId', select: 'name phone avatar' });

        res.json({ success: true, count: bookings.length, bookings });
    } catch (error) { next(error); }
};

// PUT /api/customers/bookings/:id/cancel
exports.cancelBooking = async (req, res, next) => {
    try {
        const booking = await Booking.findOne({ _id: req.params.id, customerId: req.user._id });
        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

        if (['completed', 'cancelled'].includes(booking.status)) {
            return res.status(400).json({ success: false, message: 'Cannot cancel this booking' });
        }

        const vehicle = await Vehicle.findById(booking.vehicleId);
        const penalty = await calculateCancellationPenalty(
            vehicle ? vehicle.type : 'car',
            booking.durationType,
            booking.totalPrice
        );

        booking.status = 'cancelled';
        booking.cancellationReason = req.body.reason || 'Cancelled by customer';
        booking.cancelledBy = 'customer';
        booking.cancellationPenalty = penalty;
        await booking.save();

        // Handle payment refund
        const payment = await Payment.findOne({ bookingId: booking._id });
        if (payment && payment.status === 'completed') {
            payment.status = 'refunded';
            payment.refundAmount = payment.amount - penalty;
            await payment.save();
        }

        res.json({ success: true, booking });
    } catch (error) { next(error); }
};

// POST /api/customers/reviews
exports.createReview = async (req, res, next) => {
    try {
        const { bookingId, rating, comment } = req.body;

        const booking = await Booking.findOne({ _id: bookingId, customerId: req.user._id, status: 'completed' });
        if (!booking) return res.status(400).json({ success: false, message: 'Can only review completed bookings' });

        const existingReview = await Review.findOne({ bookingId });
        if (existingReview) return res.status(400).json({ success: false, message: 'Already reviewed' });

        const review = await Review.create({
            bookingId,
            customerId: req.user._id,
            driverId: booking.driverId,
            rating,
            comment
        });

        // Update driver rating
        const allReviews = await Review.find({ driverId: booking.driverId });
        const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
        await Driver.findByIdAndUpdate(booking.driverId, {
            rating: Math.round(avgRating * 10) / 10,
            totalReviews: allReviews.length
        });

        res.status(201).json({ success: true, review });
    } catch (error) { next(error); }
};

// GET /api/customers/price-estimate
exports.getPriceEstimate = async (req, res, next) => {
    try {
        const { vehicleType, durationType, startTime, endTime, driverExperience } = req.query;
        const price = await calculatePrice(vehicleType, durationType, startTime, endTime, Number(driverExperience) || 0);
        res.json({ success: true, estimatedPrice: price });
    } catch (error) { next(error); }
};

// GET /api/customers/invoices
exports.getInvoices = async (req, res, next) => {
    try {
        const bookings = await Booking.find({ customerId: req.user._id, status: { $in: ['completed', 'cancelled'] } });
        const bookingIds = bookings.map(b => b._id);
        const payments = await Payment.find({ bookingId: { $in: bookingIds } })
            .populate('bookingId', 'startTime endTime durationType totalPrice status')
            .sort('-createdAt');

        res.json({ success: true, payments });
    } catch (error) { next(error); }
};

// PUT /api/customers/bookings/:id/extend — extend an active booking by extra months
exports.extendBooking = async (req, res, next) => {
    try {
        const { extraMonths } = req.body;
        if (!extraMonths || extraMonths < 1) {
            return res.status(400).json({ success: false, message: 'Specify at least 1 extra month' });
        }

        const booking = await Booking.findOne({
            _id: req.params.id,
            customerId: req.user._id,
            status: { $in: ['confirmed', 'active'] }
        });
        if (!booking) return res.status(404).json({ success: false, message: 'Active booking not found' });

        const oldEnd = new Date(booking.endTime);
        const newEnd = new Date(oldEnd);
        newEnd.setDate(newEnd.getDate() + (extraMonths * 30));

        // Check driver overlap
        const overlap = await Booking.findOne({
            _id: { $ne: booking._id },
            driverId: booking.driverId,
            status: { $in: ['pending', 'confirmed', 'active'] },
            startTime: { $lt: newEnd },
            endTime: { $gt: oldEnd }
        });
        if (overlap) {
            return res.status(400).json({ success: false, message: 'Driver has another booking in the extended period' });
        }

        // Calculate additional price
        const vehicle = await Vehicle.findById(booking.vehicleId);
        const driver = await Driver.findById(booking.driverId);
        const additionalPrice = await calculatePrice(
            vehicle?.type || 'car', 'monthly',
            oldEnd.toISOString(), newEnd.toISOString(),
            driver?.experience || 0
        );

        booking.endTime = newEnd;
        booking.totalPrice += additionalPrice;
        await booking.save();

        // Notify driver
        createNotification(
            driver.userId, 'booking_active',
            'Booking Extended 📅',
            `Your current booking has been extended by ${extraMonths} month(s). New end date: ${newEnd.toLocaleDateString()}.`,
            '/driver/jobs'
        );

        res.json({ success: true, booking, additionalPrice });
    } catch (error) { next(error); }
};

// POST /api/customers/favorites/:driverId — toggle favorite
exports.toggleFavorite = async (req, res, next) => {
    try {
        const existing = await Favorite.findOne({ user: req.user._id, driver: req.params.driverId });
        if (existing) {
            await existing.deleteOne();
            return res.json({ favorited: false });
        }
        await Favorite.create({ user: req.user._id, driver: req.params.driverId });
        res.json({ favorited: true });
    } catch (error) { next(error); }
};

// GET /api/customers/favorites — get all favorites
exports.getFavorites = async (req, res, next) => {
    try {
        const favorites = await Favorite.find({ user: req.user._id })
            .populate({ path: 'driver', populate: { path: 'user', select: 'name email phone' } });
        res.json(favorites);
    } catch (error) { next(error); }
};

// ═══════════ PAYMENT ENDPOINTS ═══════════

/**
 * POST /api/customers/bookings/:id/pay — initiate online payment
 * Simulates Razorpay/UPI gateway flow.
 * In production, replace the simulation with actual gateway SDK calls.
 */
exports.initiatePayment = async (req, res, next) => {
    try {
        const booking = await Booking.findOne({ _id: req.params.id, customerId: req.user._id });
        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
        if (booking.paymentStatus === 'paid') {
            return res.status(400).json({ success: false, message: 'Payment already completed' });
        }

        const { method } = req.body; // upi, card, netbanking, wallet
        const validMethods = ['upi', 'card', 'netbanking', 'wallet'];
        if (!validMethods.includes(method)) {
            return res.status(400).json({ success: false, message: 'Choose a valid online method: upi, card, netbanking, or wallet' });
        }

        // Update booking payment method
        booking.paymentMethod = method;
        await booking.save();

        // Create a pending payment record
        const existingPayment = await Payment.findOne({ bookingId: booking._id, status: 'pending' });
        let payment;
        if (existingPayment) {
            existingPayment.method = method;
            await existingPayment.save();
            payment = existingPayment;
        } else {
            payment = await Payment.create({
                bookingId: booking._id,
                customerId: req.user._id,
                amount: booking.totalPrice,
                method,
                status: 'pending'
            });
        }

        // In production, you'd call Razorpay.orders.create() here.
        // Simulating gateway response:
        const gatewayOrder = {
            orderId: 'ORD_' + Date.now() + Math.random().toString(36).substr(2, 6).toUpperCase(),
            amount: booking.totalPrice,
            currency: 'INR',
            method,
            paymentId: payment._id,
            upiId: method === 'upi' ? 'drivehire@upi' : undefined,
            status: 'created'
        };

        res.json({ success: true, order: gatewayOrder, booking });
    } catch (error) { next(error); }
};

/**
 * POST /api/customers/bookings/:id/confirm-payment — confirm payment after gateway callback
 * In production, verify Razorpay signature here before confirming.
 */
exports.confirmPayment = async (req, res, next) => {
    try {
        const { paymentId, orderId, gatewayPaymentId } = req.body;

        const booking = await Booking.findOne({ _id: req.params.id, customerId: req.user._id });
        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

        // Mark payment as completed
        const payment = await Payment.findById(paymentId);
        if (!payment) return res.status(404).json({ success: false, message: 'Payment record not found' });

        payment.status = 'completed';
        payment.transactionId = gatewayPaymentId || orderId || payment.transactionId;
        await payment.save();

        // Update booking
        booking.paymentStatus = 'paid';
        await booking.save();

        // Notify
        const driver = await Driver.findById(booking.driverId);
        if (driver) {
            createNotification(
                driver.userId, 'payment_received',
                'Payment Received 💰',
                `Online payment of ₹${booking.totalPrice.toLocaleString()} received for your booking.`,
                '/driver/jobs'
            );
        }

        res.json({ success: true, message: 'Payment confirmed successfully', booking, payment });
    } catch (error) { next(error); }
};

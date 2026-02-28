const QuickMessage = require('../models/QuickMessage');
const { MESSAGE_TEMPLATES } = require('../models/QuickMessage');
const Booking = require('../models/Booking');

// @desc    Get available quick message templates
// @route   GET /api/messages/templates
// @access  Private
exports.getTemplates = async (req, res, next) => {
    try {
        const role = req.user.role;
        const templates = MESSAGE_TEMPLATES[role] || [];
        res.json({ success: true, templates });
    } catch (err) { next(err); }
};

// @desc    Send a quick message (pre-defined only)
// @route   POST /api/messages/:bookingId
// @access  Private
exports.sendMessage = async (req, res, next) => {
    try {
        const { bookingId } = req.params;
        const { messageKey } = req.body;
        const role = req.user.role;

        // Verify booking exists and user is involved
        const booking = await Booking.findById(bookingId);
        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

        // Only allow messages for confirmed or active bookings
        if (!['confirmed', 'active'].includes(booking.status)) {
            return res.status(400).json({ success: false, message: 'Messages are only available for confirmed or active bookings' });
        }

        // Verify user is part of this booking
        const isCustomer = booking.customerId.toString() === req.user._id.toString();
        const isDriver = booking.driverId?.toString() === req.user._id.toString();
        if (!isCustomer && !isDriver) {
            return res.status(403).json({ success: false, message: 'You are not part of this booking' });
        }

        // Validate message key against templates
        const templates = MESSAGE_TEMPLATES[role] || [];
        const template = templates.find(t => t.key === messageKey);
        if (!template) {
            return res.status(400).json({ success: false, message: 'Invalid message. Only pre-defined messages are allowed.' });
        }

        const msg = await QuickMessage.create({
            bookingId,
            senderId: req.user._id,
            senderRole: role,
            messageKey: template.key,
            messageText: template.text,
        });

        res.status(201).json({ success: true, message: msg });
    } catch (err) { next(err); }
};

// @desc    Get messages for a booking
// @route   GET /api/messages/:bookingId
// @access  Private
exports.getMessages = async (req, res, next) => {
    try {
        const { bookingId } = req.params;

        // Verify user is part of this booking
        const booking = await Booking.findById(bookingId);
        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

        const isCustomer = booking.customerId.toString() === req.user._id.toString();
        const isDriver = booking.driverId?.toString() === req.user._id.toString();
        if (!isCustomer && !isDriver && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const messages = await QuickMessage.find({ bookingId }).sort({ createdAt: 1 });
        res.json({ success: true, messages });
    } catch (err) { next(err); }
};

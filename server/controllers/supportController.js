const SupportTicket = require('../models/SupportTicket');

// @desc    Create support ticket
// @route   POST /api/support
// @access  Private (customer, driver)
exports.createTicket = async (req, res, next) => {
    try {
        const { subject, description, category, priority, bookingId } = req.body;
        const ticket = await SupportTicket.create({
            userId: req.user._id,
            subject,
            description,
            category,
            priority,
            bookingId: bookingId || undefined
        });
        res.status(201).json({ success: true, ticket });
    } catch (err) { next(err); }
};

// @desc    Get my tickets
// @route   GET /api/support/my-tickets
// @access  Private
exports.getMyTickets = async (req, res, next) => {
    try {
        const tickets = await SupportTicket.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .populate('bookingId', 'pickupLocation startTime status');
        res.json({ success: true, tickets });
    } catch (err) { next(err); }
};

// @desc    Get all tickets (admin)
// @route   GET /api/support/all
// @access  Private (admin)
exports.getAllTickets = async (req, res, next) => {
    try {
        const filter = {};
        if (req.query.status) filter.status = req.query.status;
        if (req.query.priority) filter.priority = req.query.priority;

        const tickets = await SupportTicket.find(filter)
            .sort({ createdAt: -1 })
            .populate('userId', 'name email role')
            .populate('bookingId', 'pickupLocation startTime status');
        res.json({ success: true, tickets });
    } catch (err) { next(err); }
};

// @desc    Reply to ticket (admin)
// @route   PUT /api/support/:id/reply
// @access  Private (admin)
exports.replyToTicket = async (req, res, next) => {
    try {
        const ticket = await SupportTicket.findById(req.params.id);
        if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });

        ticket.adminReply = req.body.reply;
        ticket.repliedAt = new Date();
        ticket.status = req.body.status || 'in_progress';
        await ticket.save();

        res.json({ success: true, ticket });
    } catch (err) { next(err); }
};

// @desc    Update ticket status (admin)
// @route   PUT /api/support/:id/status
// @access  Private (admin)
exports.updateTicketStatus = async (req, res, next) => {
    try {
        const ticket = await SupportTicket.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true }
        );
        if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
        res.json({ success: true, ticket });
    } catch (err) { next(err); }
};

// @desc    Delete ticket (admin)
// @route   DELETE /api/support/:id
// @access  Private (admin)
exports.deleteTicket = async (req, res, next) => {
    try {
        const ticket = await SupportTicket.findByIdAndDelete(req.params.id);
        if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
        res.json({ success: true, message: 'Ticket deleted' });
    } catch (err) { next(err); }
};

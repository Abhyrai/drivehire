const mongoose = require('mongoose');

const supportTicketSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subject: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    category: {
        type: String,
        enum: ['booking', 'payment', 'driver', 'account', 'technical', 'other'],
        default: 'other'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    status: {
        type: String,
        enum: ['open', 'in_progress', 'resolved', 'closed'],
        default: 'open'
    },
    adminReply: { type: String, trim: true },
    repliedAt: Date,
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
}, { timestamps: true });

supportTicketSchema.index({ userId: 1, createdAt: -1 });
supportTicketSchema.index({ status: 1 });

module.exports = mongoose.model('SupportTicket', supportTicketSchema);

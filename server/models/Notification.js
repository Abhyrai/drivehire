const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: [
            'booking_new',          // driver: new booking request
            'booking_accepted',     // customer: driver accepted
            'booking_rejected',     // customer: driver rejected
            'booking_cancelled',    // both: booking cancelled
            'booking_completed',    // customer: job completed
            'booking_active',       // both: booking started
            'docs_verified',        // driver: documents verified
            'docs_rejected',        // driver: documents rejected
            'profile_approved',     // driver: profile approved by admin
            'profile_rejected',     // driver: profile rejected by admin
            'payment_received',     // driver: payment credited
            'review_received',      // driver: new review from customer
            'general'               // system announcement
        ],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    isRead: {
        type: Boolean,
        default: false
    },
    link: {
        type: String,
        default: ''
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true
});

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);

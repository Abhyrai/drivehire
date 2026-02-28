const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    method: {
        type: String,
        enum: ['card', 'upi', 'netbanking', 'wallet', 'cash'],
        default: 'card'
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'refunded', 'failed'],
        default: 'pending'
    },
    transactionId: {
        type: String,
        default: function () {
            return 'TXN' + Date.now() + Math.random().toString(36).substring(2, 8).toUpperCase();
        }
    },
    refundAmount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

paymentSchema.index({ bookingId: 1 });
paymentSchema.index({ customerId: 1 });
paymentSchema.index({ status: 1 });

module.exports = mongoose.model('Payment', paymentSchema);

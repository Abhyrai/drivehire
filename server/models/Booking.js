const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    driverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Driver',
        required: true
    },
    vehicleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
        required: true
    },
    startTime: {
        type: Date,
        required: [true, 'Start time is required']
    },
    endTime: {
        type: Date,
        required: [true, 'End time is required']
    },
    durationType: {
        type: String,
        enum: ['monthly'],
        default: 'monthly',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'active', 'completed', 'cancelled'],
        default: 'pending'
    },
    totalPrice: {
        type: Number,
        required: true,
        min: 0
    },
    cancellationReason: {
        type: String,
        default: ''
    },
    cancelledBy: {
        type: String,
        enum: ['customer', 'driver', 'admin', ''],
        default: ''
    },
    cancellationPenalty: {
        type: Number,
        default: 0
    },
    pickupLocation: {
        type: String,
        required: [true, 'Pickup location is required']
    },
    notes: {
        type: String,
        default: ''
    },
    paymentMethod: {
        type: String,
        enum: ['upi', 'card', 'netbanking', 'wallet', 'cash'],
        default: 'cash'
    },
    paymentStatus: {
        type: String,
        enum: ['unpaid', 'paid', 'refunded'],
        default: 'unpaid'
    }
}, {
    timestamps: true
});

bookingSchema.index({ customerId: 1, status: 1 });
bookingSchema.index({ driverId: 1, status: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Booking', bookingSchema);

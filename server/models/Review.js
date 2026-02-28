const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true,
        unique: true
    },
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
    rating: {
        type: Number,
        required: [true, 'Rating is required'],
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        maxlength: 500,
        default: ''
    }
}, {
    timestamps: true
});

reviewSchema.index({ driverId: 1 });
reviewSchema.index({ customerId: 1 });

module.exports = mongoose.model('Review', reviewSchema);

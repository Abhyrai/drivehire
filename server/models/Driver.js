const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    licenseNumber: {
        type: String,
        required: [true, 'License number is required'],
        trim: true
    },
    licenseImage: {
        type: String,
        default: ''
    },
    idProofImage: {
        type: String,
        default: ''
    },
    aadhaarNumber: {
        type: String,
        default: '',
        trim: true
    },
    aadhaarImage: {
        type: String,
        default: ''
    },
    documentStatus: {
        type: String,
        enum: ['not_uploaded', 'pending_review', 'verified', 'rejected'],
        default: 'not_uploaded'
    },
    verificationRemarks: {
        type: String,
        default: ''
    },
    verifiedAt: {
        type: Date,
        default: null
    },
    experience: {
        type: Number,
        required: true,
        min: 0,
        max: 50
    },
    languages: {
        type: [String],
        default: ['English']
    },
    vehicleTypes: {
        type: [String],
        enum: ['car', 'bike'],
        required: true
    },
    transmissions: {
        type: [String],
        enum: ['manual', 'automatic', 'both'],
        default: ['manual']
    },
    city: {
        type: String,
        required: [true, 'City is required']
    },
    availability: {
        type: String,
        enum: ['available', 'busy', 'offline'],
        default: 'offline'
    },
    availableFrom: Date,
    availableTo: Date,
    isApproved: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    isOnline: {
        type: Boolean,
        default: false
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    totalReviews: {
        type: Number,
        default: 0
    },
    totalEarnings: {
        type: Number,
        default: 0
    },
    completedJobs: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

driverSchema.index({ city: 1, isApproved: 1, isOnline: 1 });
driverSchema.index({ vehicleTypes: 1 });
driverSchema.index({ rating: -1 });

module.exports = mongoose.model('Driver', driverSchema);

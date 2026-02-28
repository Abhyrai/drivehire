const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['car', 'bike'],
        required: [true, 'Vehicle type is required']
    },
    make: {
        type: String,
        required: [true, 'Vehicle make is required'],
        trim: true
    },
    model: {
        type: String,
        required: [true, 'Vehicle model is required'],
        trim: true
    },
    year: {
        type: Number,
        required: true,
        min: 1990,
        max: 2030
    },
    plateNumber: {
        type: String,
        required: [true, 'Plate number is required'],
        uppercase: true,
        trim: true
    },
    transmission: {
        type: String,
        enum: ['manual', 'automatic'],
        required: true
    },
    fuelType: {
        type: String,
        enum: ['petrol', 'diesel', 'electric', 'hybrid', 'cng'],
        required: true
    },
    color: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

vehicleSchema.index({ ownerId: 1 });

module.exports = mongoose.model('Vehicle', vehicleSchema);

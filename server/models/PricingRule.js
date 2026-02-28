const mongoose = require('mongoose');

const pricingRuleSchema = new mongoose.Schema({
    vehicleType: {
        type: String,
        enum: ['car', 'bike'],
        required: true
    },
    durationType: {
        type: String,
        enum: ['monthly'],
        default: 'monthly',
        required: true
    },
    baseRate: {
        type: Number,
        required: true,
        min: 0
    },
    experienceMultiplier: {
        type: Number,
        default: 1.0,
        min: 1.0
    },
    cancellationPenaltyPercent: {
        type: Number,
        default: 10,
        min: 0,
        max: 100
    }
}, {
    timestamps: true
});

pricingRuleSchema.index({ vehicleType: 1, durationType: 1 }, { unique: true });

module.exports = mongoose.model('PricingRule', pricingRuleSchema);

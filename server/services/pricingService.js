const PricingRule = require('../models/PricingRule');

const calculatePrice = async (vehicleType, durationType, startTime, endTime, driverExperience = 0) => {
    const rule = await PricingRule.findOne({ vehicleType, durationType: 'monthly' });

    const start = new Date(startTime);
    const end = new Date(endTime);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const months = Math.max(1, Math.ceil(days / 30)); // minimum 1 month

    if (!rule) {
        // Fallback pricing (per month)
        const fallbackRates = {
            car: 25000,  // ₹25,000/month for car
            bike: 12000  // ₹12,000/month for bike
        };
        const rate = fallbackRates[vehicleType] || 25000;
        return Math.round(rate * months);
    }

    // Experience multiplier: 1.0 + (experience * 0.02), capped at configured max
    const expMultiplier = Math.min(
        1.0 + (driverExperience * 0.02),
        rule.experienceMultiplier
    );

    return Math.round(rule.baseRate * months * expMultiplier);
};

const calculateCancellationPenalty = async (vehicleType, durationType, totalPrice) => {
    const rule = await PricingRule.findOne({ vehicleType, durationType: 'monthly' });
    const penaltyPercent = rule ? rule.cancellationPenaltyPercent : 10;
    return Math.round(totalPrice * (penaltyPercent / 100));
};

module.exports = { calculatePrice, calculateCancellationPenalty };

const mongoose = require('mongoose');

// Pre-defined quick messages for safe driver-customer communication
const quickMessageSchema = new mongoose.Schema({
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    senderRole: { type: String, enum: ['customer', 'driver'], required: true },
    messageKey: { type: String, required: true }, // key referencing predefined message
    messageText: { type: String, required: true }, // the actual text for display
}, { timestamps: true });

quickMessageSchema.index({ bookingId: 1, createdAt: 1 });

module.exports = mongoose.model('QuickMessage', quickMessageSchema);

// Pre-defined message templates (exported for use in controllers)
module.exports.MESSAGE_TEMPLATES = {
    customer: [
        { key: 'on_my_way', text: '🚶 I am on my way to the pickup location', icon: '🚶' },
        { key: 'at_pickup', text: '📍 I am at the pickup location', icon: '📍' },
        { key: 'running_late', text: '⏰ I am running a few minutes late', icon: '⏰' },
        { key: 'cancel_request', text: '❌ I need to cancel this booking', icon: '❌' },
        { key: 'change_pickup', text: '📋 I need to change the pickup location', icon: '📋' },
        { key: 'thank_you', text: '🙏 Thank you for the safe ride!', icon: '🙏' },
        { key: 'how_long', text: '⏳ How long until you arrive?', icon: '⏳' },
        { key: 'vehicle_details', text: '🚗 Sharing my vehicle details with you', icon: '🚗' },
    ],
    driver: [
        { key: 'on_my_way', text: '🚗 I am on my way to pick you up', icon: '🚗' },
        { key: 'arrived', text: '✅ I have arrived at the pickup location', icon: '✅' },
        { key: 'running_late', text: '⏰ I am running a few minutes late', icon: '⏰' },
        { key: 'ride_started', text: '🏁 Ride has started', icon: '🏁' },
        { key: 'ride_ending', text: '🔜 We are about to reach the destination', icon: '🔜' },
        { key: 'ride_completed', text: '✅ Ride completed. Thank you!', icon: '✅' },
        { key: 'traffic_delay', text: '🚦 Stuck in traffic, will be delayed', icon: '🚦' },
        { key: 'call_request', text: '📞 Please call me for directions', icon: '📞' },
    ]
};

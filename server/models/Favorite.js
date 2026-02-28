const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    driver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Driver',
        required: true
    }
}, {
    timestamps: true
});

// Prevent duplicate favorites
favoriteSchema.index({ user: 1, driver: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);

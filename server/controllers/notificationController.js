const Notification = require('../models/Notification');

// Helper to create a notification
exports.createNotification = async (userId, type, title, message, link = '', metadata = {}) => {
    try {
        return await Notification.create({ userId, type, title, message, link, metadata });
    } catch (err) {
        console.error('Notification create error:', err.message);
    }
};

// GET /api/notifications — get user's notifications
exports.getNotifications = async (req, res, next) => {
    try {
        const notifications = await Notification.find({ userId: req.user._id })
            .sort('-createdAt')
            .limit(50);

        const unreadCount = await Notification.countDocuments({ userId: req.user._id, isRead: false });

        res.json({ success: true, notifications, unreadCount });
    } catch (error) { next(error); }
};

// PUT /api/notifications/:id/read — mark single as read
exports.markAsRead = async (req, res, next) => {
    try {
        await Notification.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { isRead: true }
        );
        res.json({ success: true });
    } catch (error) { next(error); }
};

// PUT /api/notifications/read-all — mark all as read
exports.markAllRead = async (req, res, next) => {
    try {
        await Notification.updateMany(
            { userId: req.user._id, isRead: false },
            { isRead: true }
        );
        res.json({ success: true });
    } catch (error) { next(error); }
};

// GET /api/notifications/unread-count
exports.getUnreadCount = async (req, res, next) => {
    try {
        const count = await Notification.countDocuments({ userId: req.user._id, isRead: false });
        res.json({ success: true, count });
    } catch (error) { next(error); }
};

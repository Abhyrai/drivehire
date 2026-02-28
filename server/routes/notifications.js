const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const n = require('../controllers/notificationController');

router.use(protect);

router.get('/', n.getNotifications);
router.get('/unread-count', n.getUnreadCount);
router.put('/read-all', n.markAllRead);
router.put('/:id/read', n.markAsRead);

module.exports = router;

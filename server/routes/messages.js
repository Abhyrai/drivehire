const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getTemplates, sendMessage, getMessages } = require('../controllers/messageController');

router.use(protect);

router.get('/templates', getTemplates);
router.post('/:bookingId', sendMessage);
router.get('/:bookingId', getMessages);

module.exports = router;

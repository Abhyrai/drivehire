const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { createTicket, getMyTickets, getAllTickets, replyToTicket, updateTicketStatus, deleteTicket } = require('../controllers/supportController');

router.use(protect);

router.post('/', createTicket);
router.get('/my-tickets', getMyTickets);
router.get('/all', authorize('admin'), getAllTickets);
router.put('/:id/reply', authorize('admin'), replyToTicket);
router.put('/:id/status', authorize('admin'), updateTicketStatus);
router.delete('/:id', authorize('admin'), deleteTicket);

module.exports = router;

const express = require('express');
const router = express.Router();
const { createTicket } = require('../controllers/ticketController');

router.post('/tickets/create', createTicket);

module.exports = router;
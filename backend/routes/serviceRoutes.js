const express = require('express');
const router = express.Router();
const { 
    getSlots, 
    bookService, 
    getUserJobs, 
    getAllBikeJobs, 
    updateJobStatus,
    getNotifications,
    markAsRead,
    clearAllNotifications
} = require('../controllers/serviceController');

router.get('/slots', getSlots);
router.post('/book', bookService);
router.get('/user/:userId', getUserJobs);
router.get('/all', getAllBikeJobs);
router.put('/update/:id', updateJobStatus);

// Notification System Operations Table
router.get('/notifications/:recipientId', getNotifications);
router.put('/notifications/read/:id', markAsRead);
router.delete('/notifications/clear/:recipientId', clearAllNotifications);

module.exports = router;
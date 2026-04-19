const express = require('express');
const {
    getNotifications,
    markAllRead,
    createNotification,
    getOwnerNotifications,
    markAsRead
} = require('../controllers/notificationController');

const router = express.Router();

const { protect } = require('../middlewares/authMiddleware');

// Public/Semi-public for Owner string IDs
router.get('/owner/:ownerId', getOwnerNotifications);
router.put('/:id/read', markAsRead);

// Protected for standard Users
router.use(protect);

router.route('/')
    .get(getNotifications)
    .post(createNotification);

router.put('/mark-read', markAllRead);

module.exports = router;

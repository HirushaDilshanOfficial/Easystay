const express = require('express');
const {
    getNotifications,
    markAllRead,
    createNotification
} = require('../controllers/notificationController');

const router = express.Router();

const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

router.route('/')
    .get(getNotifications)
    .post(createNotification);

router.put('/mark-read', markAllRead);

module.exports = router;

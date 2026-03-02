const Notification = require('../models/Notification');

// @desc    Get all notifications for logged in user
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res, next) => {
    try {
        let notifications = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 });

        // Seed initial notifications if none exist
        if (notifications.length === 0) {
            const defaultNotes = [
                {
                    user: req.user.id,
                    title: 'Welcome to EasyStay',
                    description: 'We are glad to have you! Explore our features and find your perfect boarding place.',
                    type: 'info'
                },
                {
                    user: req.user.id,
                    title: 'Profile Tip',
                    description: 'Make sure to update your phone number and address in the profile section.',
                    type: 'success'
                }
            ];
            await Notification.insertMany(defaultNotes);
            notifications = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 });
        }

        res.status(200).json({ success: true, data: notifications });
    } catch (err) {
        next(err);
    }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/mark-read
// @access  Private
exports.markAllRead = async (req, res, next) => {
    try {
        await Notification.updateMany({ user: req.user.id, isRead: false }, { isRead: true });
        res.status(200).json({ success: true, message: 'All notifications marked as read' });
    } catch (err) {
        next(err);
    }
};

// @desc    Create a notification (Internal helper or admin action)
// @route   POST /api/notifications
// @access  Private
exports.createNotification = async (req, res, next) => {
    try {
        const { userId, title, description, type } = req.body;
        const notification = await Notification.create({
            user: userId || req.user.id,
            title,
            description,
            type: type || 'info'
        });
        res.status(201).json({ success: true, data: notification });
    } catch (err) {
        next(err);
    }
};

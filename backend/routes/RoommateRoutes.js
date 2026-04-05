const express = require('express');
const router = express.Router();
const {
    getMyProfile,
    createOrUpdateProfile,
    getMatchedRoommates
} = require('../controllers/RoommateController');

// Ensure that we have a middleware to protect routes, assuming it's available in middlewares/auth.js
// If it's called something else, we will need to change this. I will check.
// Ensure that we have a middleware to protect routes
const { protect, authorize } = require('../middlewares/authMiddleware');

router.post('/', protect, authorize('Student', 'BoardingOwner', 'Admin'), createOrUpdateProfile);
router.post('/save', protect, authorize('Student', 'BoardingOwner', 'Admin'), createOrUpdateProfile);

router
    .route('/me')
    .get(protect, getMyProfile);

router
    .route('/match')
    .get(protect, getMatchedRoommates);

module.exports = router;

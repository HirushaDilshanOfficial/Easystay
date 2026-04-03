const express = require('express');
const router = express.Router();
const {
    getMyProfile,
    createOrUpdateProfile,
    getMatchedRoommates
} = require('../controllers/RoommateController');

// Ensure that we have a middleware to protect routes, assuming it's available in middlewares/auth.js
// If it's called something else, we will need to change this. I will check.
const { protect, authorize } = require('../middlewares/authMiddleware');

router
    .route('/')
    .post(protect, authorize('Student'), createOrUpdateProfile);

router
    .route('/me')
    .get(protect, authorize('Student'), getMyProfile);

router
    .route('/match')
    .get(protect, authorize('Student'), getMatchedRoommates);

module.exports = router;

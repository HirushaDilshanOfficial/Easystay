const express = require('express');
const router = express.Router();
const { getReviews, addReview } = require('../controllers/ReviewController');

router.get('/:boardingId', getReviews);
router.post('/:boardingId', addReview);

module.exports = router;

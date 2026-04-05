const Review = require('../models/ReviewModel');

// GET /api/reviews/:boardingId — get all reviews for a specific boarding
exports.getReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ boardingId: req.params.boardingId }).sort({ createdAt: -1 });
        res.json({ success: true, data: reviews });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch reviews.' });
    }
};

// POST /api/reviews/:boardingId — submit a review for a specific boarding
exports.addReview = async (req, res) => {
    try {
        const { userName, userEmail, rating, comment, isAnonymous } = req.body;
        if (!userName || !userEmail || !rating || !comment) {
            return res.status(400).json({ success: false, message: 'All fields are required.' });
        }

        const review = await Review.create({
            boardingId: req.params.boardingId,
            userName: isAnonymous === true || isAnonymous === 'true' ? 'Anonymous' : userName,
            originalUserName: userName,
            isAnonymous: isAnonymous === true || isAnonymous === 'true',
            userEmail,
            rating: Number(rating),
            comment
        });

        res.status(201).json({ success: true, data: review });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to submit review.' });
    }
};

const express = require("express");
const router = express.Router();

const reviewController = require("../controllers/reviewController");

router.post("/submit", reviewController.submitReview);

router.get("/", reviewController.getReviews);

router.put("/approve/:id", reviewController.approveReview);

module.exports = router;
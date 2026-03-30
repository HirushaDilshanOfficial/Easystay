const express = require("express");
const router = express.Router();

const Review = require("../models/Review");
const Booking = require("../models/Booking");

// 🔹 GET approved reviews
router.get("/", async (req, res) => {
  const reviews = await Review.find({ approved: true });
  res.json(reviews);
});

// 🔹 GET all (for admin)
router.get("/all", async (req, res) => {
  const reviews = await Review.find();
  res.json(reviews);
});

// 🔹 SUBMIT REVIEW (VALIDATED)
router.post("/", async (req, res) => {
  try {
    const { text, rating, bookingId, anonymous } = req.body;

    // ❌ booking check
    const booking = await Booking.findOne({ bookingId });

    if (!booking) {
      return res.status(400).json({ error: "Invalid Booking ID" });
    }

    // ❌ eligibility check
    const check = booking.isEligibleForReview();

    if (!check.eligible) {
      return res.status(400).json({ error: check.reason });
    }

    // ❌ duplicate check
    const existing = await Review.findOne({ bookingId });
    if (existing) {
      return res.status(400).json({ error: "Review already exists" });
    }

    // ❌ fake detection
    if (text.length < 5) {
      return res.status(400).json({ error: "Suspicious review" });
    }

    // ✅ create review
    const newReview = new Review({
      text,
      rating,
      bookingId,
      anonymous,
      approved: false,
    });

    await newReview.save();

    // 🔹 mark booking
    booking.reviewSubmitted = true;
    await booking.save();

    res.json({ message: "Review submitted for approval" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 ADMIN APPROVE
router.put("/approve/:id", async (req, res) => {
  await Review.findByIdAndUpdate(req.params.id, { approved: true });
  res.json({ message: "Approved" });
});

// 🔹 DELETE
router.delete("/:id", async (req, res) => {
  await Review.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

module.exports = router;
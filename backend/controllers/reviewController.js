const Review          = require("../models/Review");
const Booking         = require("../models/Booking");
const Boarding        = require("../models/Boarding");
const detectFake      = require("../utils/detectFakeReview");
const { updateBoardingAnalytics } = require("../utils/analytics");

// ── Submit ───────────────────────────────────────────────────────────────
exports.submitReview = async (req, res) => {
  try {
    const { bookingId, boardingId, isAnonymous, ratings, comment } = req.body;
    const userId = req.user._id;
    const ip     = req.clientIP || req.ip;

    // 1 — Validate booking ID
    if (!bookingId?.trim())
      return res.status(400).json({ success: false, message: "Booking ID is required." });

    // 2 — Find & verify booking
    const booking = await Booking.findOne({ bookingId: bookingId.toUpperCase() });
    if (!booking)
      return res.status(404).json({ success: false, message: "Booking not found. Check your Booking ID." });
    if (booking.student.toString() !== userId.toString())
      return res.status(403).json({ success: false, message: "This booking does not belong to your account." });
    if (booking.boarding.toString() !== boardingId)
      return res.status(400).json({ success: false, message: "Boarding ID does not match this booking." });

    // 3 — Eligibility
    const { eligible, reason } = booking.isEligibleForReview();
    if (!eligible) return res.status(403).json({ success: false, message: reason });

    // 4 — Validate ratings
    const ratingFields = ["overall", "cleanliness", "safety", "ownerBehavior", "valueForMoney"];
    for (const f of ratingFields) {
      const v = Number(ratings?.[f]);
      if (!Number.isInteger(v) || v < 1 || v > 5)
        return res.status(400).json({ success: false, message: `Invalid rating for "${f}". Must be 1–5.` });
    }

    // 5 — Existing review check
    if (await Review.findOne({ booking: booking._id }))
      return res.status(409).json({ success: false, message: "Review already submitted for this booking." });

    // 6 — Fake detection
    const { isSuspicious, suspicionReasons } = await detectFake({
      reviewerId: userId, boardingId, ipAddress: ip, comment, ratings,
    });

    // 7 — Create
    const review = await Review.create({
      booking: booking._id, boarding: boardingId, reviewer: userId,
      isAnonymous: !!isAnonymous, ratings, comment,
      status: isSuspicious ? "flagged" : "pending",
      metadata: { ipAddress: ip, userAgent: req.headers["user-agent"] },
      isSuspicious, suspicionReasons,
    });

    // 8 — Mark booking reviewed
    booking.reviewSubmitted = true;
    booking.reviewAllowed   = false;
    await booking.save({ validateBeforeSave: false });

    res.status(201).json({
      success: true,
      message: isSuspicious
        ? "Review flagged for admin check due to unusual activity."
        : "Review submitted! It will be visible after approval.",
      data: { reviewId: review._id, status: review.status },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Get approved reviews for a boarding ─────────────────────────────────
exports.getByBoarding = async (req, res) => {
  try {
    const { boardingId } = req.params;
    const { page = 1, limit = 8, sort = "-createdAt" } = req.query;
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      Review.find({ boarding: boardingId, status: "approved" })
        .populate("reviewer", "name")
        .sort(sort).skip(+skip).limit(+limit)
        .select("-metadata.ipAddress -suspicionReasons -reportedBy -editHistory"),
      Review.countDocuments({ boarding: boardingId, status: "approved" }),
    ]);

    const data = reviews.map((r) => ({
      ...r.toObject(),
      reviewer: r.isAnonymous ? { name: "Anonymous Student" } : r.reviewer,
    }));

    res.json({ success: true, data, pagination: { total, page: +page, pages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Analytics for a boarding ─────────────────────────────────────────────
exports.getAnalytics = async (req, res) => {
  try {
    const boarding = await Boarding.findById(req.params.boardingId)
      .select("name analytics badge");
    if (!boarding) return res.status(404).json({ success: false, message: "Boarding not found." });
    res.json({ success: true, data: boarding });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Edit (within window) ─────────────────────────────────────────────────
exports.editReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: "Review not found." });
    if (review.reviewer.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: "Not your review." });

    const hrs = (Date.now() - review.createdAt) / 3600000;
    const WINDOW = parseInt(process.env.REVIEW_EDIT_WINDOW_HOURS) || 24;
    if (hrs > WINDOW)
      return res.status(403).json({ success: false, message: `Edit window (${WINDOW}h) has passed.` });

    review.editHistory.push({ previousComment: review.comment, previousRatings: review.ratings.toObject() });
    if (req.body.comment) review.comment = req.body.comment;
    if (req.body.ratings) Object.assign(review.ratings, req.body.ratings);
    review.isEdited = true;
    review.status   = "pending";
    await review.save();

    res.json({ success: true, message: "Review updated. Pending re-approval.", data: review });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Report ───────────────────────────────────────────────────────────────
exports.reportReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: "Review not found." });
    if (review.reportedBy.includes(req.user._id))
      return res.status(409).json({ success: false, message: "Already reported." });

    review.reportedBy.push(req.user._id);
    if (review.reportedBy.length >= 3 && review.status !== "flagged") {
      review.status = "flagged";
      review.suspicionReasons.push(`Reported by ${review.reportedBy.length} users.`);
    }
    await review.save();
    res.json({ success: true, message: "Review reported. Admin will investigate." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── My reviews ───────────────────────────────────────────────────────────
exports.myReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ reviewer: req.user._id })
      .populate("boarding", "name address").sort("-createdAt");
    res.json({ success: true, data: reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
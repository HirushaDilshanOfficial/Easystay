const Review = require("../models/Review");
const User = require("../models/User");

// GET ALL REVIEWS
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find();
    res.json({ success: true, data: reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET SUSPICIOUS REVIEWS
exports.getSuspiciousReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ isSuspicious: true });
    res.json({ success: true, data: reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// APPROVE
exports.approve = async (req, res) => {
  try {
    const r = await Review.findById(req.params.id);
    if (!r) return res.status(404).json({ message: "Not found" });

    r.status = "approved";
    await r.save();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// REJECT
exports.reject = async (req, res) => {
  try {
    const r = await Review.findById(req.params.id);
    if (!r) return res.status(404).json({ message: "Not found" });

    r.status = "rejected";
    await r.save();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE
exports.remove = async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// SUSPEND USER
exports.suspendUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    user.isSuspended = true;
    await user.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UNSUSPEND USER
exports.unsuspendUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    user.isSuspended = false;
    await user.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET SUSPENDED USERS
exports.getSuspendedUsers = async (req, res) => {
  try {
    const users = await User.find({ isSuspended: true });
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// IP MONITOR
exports.ipMonitor = async (req, res) => {
  res.json({ message: "IP monitor working" });
};

// STATS
exports.stats = async (req, res) => {
  const total = await Review.countDocuments();
  res.json({ total });
};
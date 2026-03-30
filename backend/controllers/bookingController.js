const Booking = require("../models/Booking");
const { v4: uuid } = require("crypto");

const genId = () => "ES-" + Math.random().toString(36).slice(2, 10).toUpperCase();

exports.create = async (req, res) => {
  try {
    const { studentId, boardingId, checkInDate, checkOutDate } = req.body;
    const booking = await Booking.create({
      bookingId: genId(), student: studentId, boarding: boardingId,
      checkInDate, checkOutDate, status: "confirmed",
    });
    res.status(201).json({ success: true, data: { bookingId: booking.bookingId, _id: booking._id } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.checkIn = async (req, res) => {
  try {
    const b = await Booking.findOne({ bookingId: req.params.id.toUpperCase() });
    if (!b) return res.status(404).json({ success: false, message: "Booking not found." });
    b.actualCheckIn = new Date(); b.status = "checked_in"; await b.save();
    res.json({ success: true, message: "Check-in recorded." });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.checkOut = async (req, res) => {
  try {
    const b = await Booking.findOne({ bookingId: req.params.id.toUpperCase() });
    if (!b) return res.status(404).json({ success: false, message: "Booking not found." });
    b.actualCheckOut = new Date(); b.status = "completed"; await b.save();
    const { eligible, reason } = b.isEligibleForReview();
    res.json({ success: true, message: "Check-out recorded.", data: { totalDaysStayed: b.totalDaysStayed, reviewEligible: eligible, reviewMessage: reason } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.verify = async (req, res) => {
  try {
    const b = await Booking.findOne({ bookingId: req.params.id.toUpperCase(), student: req.user._id })
      .populate("boarding", "name address");
    if (!b) return res.status(404).json({ success: false, message: "Booking not found or not yours." });
    const { eligible, reason } = b.isEligibleForReview();
    res.json({ success: true, data: { ...b.toObject(), reviewEligible: eligible, reviewMessage: reason } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.myBookings = async (req, res) => {
  try {
    const list = await Booking.find({ student: req.user._id })
      .populate("boarding", "name address analytics.averageOverall").sort("-createdAt");
    res.json({ success: true, data: list });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
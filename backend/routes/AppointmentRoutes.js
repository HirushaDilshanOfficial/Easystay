const express = require("express");
const router = express.Router();
const { getAvailableSlots, bookAppointment } = require("../Controller/AppointmentController");
const { protect } = require("../middlewares/authMiddleware");

// @route   GET /api/appointments/available/:boardingId/:date
router.get("/available/:boardingId/:date", getAvailableSlots);

// @route   POST /api/appointments/book
router.post("/book", protect, bookAppointment);

module.exports = router;

const express = require("express");
const router = express.Router();
const { getAvailableSlots, bookAppointment } = require("../Controller/AppointmentController");

// @route   GET /api/appointments/available/:boardingId/:date
router.get("/available/:boardingId/:date", getAvailableSlots);

// @route   POST /api/appointments/book
router.post("/book", bookAppointment);

module.exports = router;

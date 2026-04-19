const express = require("express");
const router = express.Router();
const { 
    getAvailableSlots, 
    bookAppointment, 
    updateAppointmentStatus, 
    deleteAppointment 
} = require("../controllers/AppointmentController");
const { protect } = require("../middlewares/authMiddleware");

// @route   GET /api/appointments/available/:boardingId/:date
router.get("/available/:boardingId/:date", getAvailableSlots);

// @route   POST /api/appointments/book
router.post("/book", protect, bookAppointment);

// @route   PUT /api/appointments/status/:id
router.put("/status/:id", protect, updateAppointmentStatus);

// @route   DELETE /api/appointments/:id
router.delete("/:id", protect, deleteAppointment);

module.exports = router;

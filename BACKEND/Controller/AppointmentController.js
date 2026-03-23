const Appointment = require("../Model/AppointmentModel");


const DEFAULT_SLOTS = [
    "09:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "01:00 PM",
    "02:00 PM",
    "03:00 PM",
    "04:00 PM",
    "05:00 PM",
];

// ─────────────────────────────────────────────
// @desc    Get available time slots for a specific date
// @route   GET /api/appointments/available/:boardingId/:date
// @access  Public
// ─────────────────────────────────────────────
const getAvailableSlots = async (req, res) => {
    try {
        const { boardingId, date } = req.params;

        // Find all appointments for this boarding and date
        const bookedAppointments = await Appointment.find({ boardingId, date });
        const bookedSlots = bookedAppointments.map((app) => app.timeSlot);

        // Filter out booked slots from default slots
        const availableSlots = DEFAULT_SLOTS.map((slot) => ({
            time: slot,
            isBooked: bookedSlots.includes(slot),
        }));

        res.status(200).json({
            success: true,
            data: availableSlots,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch available slots",
            error: error.message,
        });
    }
};

// ─────────────────────────────────────────────
// @desc    Book a new appointment
// @route   POST /api/appointments/book
// @access  Public
// ─────────────────────────────────────────────
const bookAppointment = async (req, res) => {
    try {
        const { boardingId, date, timeSlot, userName, userEmail, userPhone } = req.body;

        // Check if the slot is already booked (Safety check)
        const existingAppointment = await Appointment.findOne({
            boardingId,
            date,
            timeSlot,
        });

        if (existingAppointment) {
            return res.status(400).json({
                success: false,
                message: "This time slot is already booked. Please choose another one.",
            });
        }

        const newAppointment = new Appointment({
            boardingId,
            date,
            timeSlot,
            userName,
            userEmail,
            userPhone,
        });

        const savedAppointment = await newAppointment.save();

        res.status(201).json({
            success: true,
            message: "Appointment booked successfully!",
            data: savedAppointment,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to book appointment",
            error: error.message,
        });
    }
};

module.exports = {
    getAvailableSlots,
    bookAppointment,
};

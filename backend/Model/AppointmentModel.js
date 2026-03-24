const mongoose = require("mongoose");

const AppointmentSchema = new mongoose.Schema(
    {
        boardingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Boarding",
            required: true,
        },
        date: {
            type: String, // format YYYY-MM-DD
            required: true,
        },
        timeSlot: {
            type: String, // e.g., "10:00 AM"
            required: true,
        },
        userName: {
            type: String,
            required: true,
        },
        userEmail: {
            type: String,
            required: true,
        },
        userPhone: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

// Prevent double booking for the same boarding, date, and time slot
AppointmentSchema.index({ boardingId: 1, date: 1, timeSlot: 1 }, { unique: true });

module.exports = mongoose.model("Appointment", AppointmentSchema);

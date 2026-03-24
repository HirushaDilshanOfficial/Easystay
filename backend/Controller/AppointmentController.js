const Appointment = require("../Model/AppointmentModel");
const Boarding = require("../Model/BoardingModel");
const sendEmail = require("../utils/emailService");

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
// @access  Private (Protected)
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

        // Send Email Notification to Owner
        try {
            const boarding = await Boarding.findById(boardingId);
            if (boarding && boarding.ownerEmail) {
                await sendEmail({
                    email: boarding.ownerEmail,
                    subject: 'New Appointment Request - EasyStay',
                    message: `You have a new appointment request for your property "${boarding.title}".`,
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                            <h2 style="color: #2563eb; text-align: center;">New Appointment Request</h2>
                            <p>Hi ${boarding.ownerName || 'Property Owner'},</p>
                            <p>A student has requested to view your property: <strong>${boarding.title}</strong>.</p>
                            
                            <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0;">
                                <h3 style="margin-top: 0; color: #1e293b; font-size: 16px;">Appointment Details</h3>
                                <p style="margin: 5px 0;"><strong>Date:</strong> ${date}</p>
                                <p style="margin: 5px 0;"><strong>Time Slot:</strong> ${timeSlot}</p>
                            </div>

                            <div style="background-color: #f0f7ff; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #d0e1fd;">
                                <h3 style="margin-top: 0; color: #1e293b; font-size: 16px;">Student Information</h3>
                                <p style="margin: 5px 0;"><strong>Name:</strong> ${userName}</p>
                                <p style="margin: 5px 0;"><strong>Email:</strong> ${userEmail}</p>
                                <p style="margin: 5px 0;"><strong>Phone:</strong> ${userPhone}</p>
                            </div>

                            <p style="color: #64748b; font-size: 14px;">Please be available at the scheduled time to show your property. You can also see this in your Owner Dashboard.</p>
                            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                            <p style="text-align: center; color: #94a3b8; font-size: 12px;">© 2026 EasyStay. All rights reserved.</p>
                        </div>
                    `
                });
            }
        } catch (mailErr) {
            console.error('Failed to send appointment notification email:', mailErr);
            // Don't fail the booking if email fails
        }

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

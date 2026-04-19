const Appointment = require("../models/AppointmentModel");
const Boarding = require("../models/BoardingModel");
const Notification = require("../models/Notification");
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

        // Find only appointments that are Pending or Approved
        const bookedAppointments = await Appointment.find({ 
            boardingId, 
            date,
            status: { $in: ["Pending", "Approved"] }
        });
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
            status: { $in: ["Pending", "Approved"] }
        });

        if (existingAppointment) {
            return res.status(400).json({
                success: false,
                message: "This time slot is already booked. Please choose another one.",
            });
        }

        // Phone Validation (10 digits)
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(userPhone)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid 10-digit phone number.",
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

        // Send Email & Notification to Owner
        try {
            const boarding = await Boarding.findById(boardingId);
            if (boarding) {
                // 1. Email to Owner
                if (boarding.ownerEmail) {
                    await sendEmail({
                        email: boarding.ownerEmail,
                        subject: 'New Appointment Request - EasyStay',
                        html: `
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                                <h2 style="color: #2563eb; text-align: center;">New Appointment Request</h2>
                                <p>Hi ${boarding.ownerName || 'Property Owner'},</p>
                                <p>A student has requested to view your property: <strong>${boarding.title}</strong>.</p>
                                <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0;">
                                    <p><strong>Date:</strong> ${date}</p>
                                    <p><strong>Time Slot:</strong> ${timeSlot}</p>
                                    <p><strong>Student:</strong> ${userName} (${userPhone})</p>
                                </div>
                                <p>Please check your Owner Dashboard to approve or reject this request.</p>
                                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                                <p style="text-align: center; color: #94a3b8; font-size: 12px;">© 2026 EasyStay. All rights reserved.</p>
                            </div>
                        `
                    });
                }

                // 2. Notification to Owner (Dashboard)
                if (boarding.ownerId) {
                    await Notification.create({
                        user: boarding.ownerId,
                        title: 'New Appointment Request',
                        description: `${userName} requested a visit for ${boarding.title} on ${date} at ${timeSlot}.`,
                        type: 'info'
                    });
                }
            }
        } catch (err) {
            console.error('Failed to send owner notifications:', err);
        }

        // Send Email to Student (Waiting for approval)
        try {
            await sendEmail({
                email: userEmail,
                subject: 'Appointment Request Received - EasyStay',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                        <h2 style="color: #2563eb; text-align: center;">Appointment Request Received</h2>
                        <p>Hi ${userName},</p>
                        <p>Thank you for choosing EasyStay! Your appointment request has been sent to the property owner.</p>
                        <div style="background-color: #f0f7ff; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #d0e1fd;">
                            <p><strong>Date:</strong> ${date}</p>
                            <p><strong>Time Slot:</strong> ${timeSlot}</p>
                        </div>
                        <p style="color: #ef4444; font-weight: bold;">Please wait until the owner approves your visit. You will receive another email once it is confirmed.</p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                        <p style="text-align: center; color: #94a3b8; font-size: 12px;">© 2026 EasyStay. All rights reserved.</p>
                    </div>
                `
            });
        } catch (mailErr) {
            console.error('Failed to send student booking email:', mailErr);
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

// ─────────────────────────────────────────────
// @desc    Update appointment status (Approve/Reject)
// @route   PUT /api/appointments/status/:id
// @access  Private (Owner/Admin)
// ─────────────────────────────────────────────
const updateAppointmentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, rejectionReason } = req.body;

        if (!["Pending", "Approved", "Rejected"].includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status" });
        }

        const appointment = await Appointment.findByIdAndUpdate(
            id,
            { status, rejectionReason: rejectionReason || "" },
            { new: true }
        );

        if (!appointment) {
            return res.status(404).json({ success: false, message: "Appointment not found" });
        }

        // If Approved, send email to student
        if (status === 'Approved') {
            try {
                // Fetch boarding title for email
                const boarding = await Boarding.findById(appointment.boardingId);
                await sendEmail({
                    email: appointment.userEmail,
                    subject: 'Appointment Approved - EasyStay 🎉',
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                            <h2 style="color: #10b981; text-align: center;">Appointment Approved!</h2>
                            <p>Hi ${appointment.userName},</p>
                            <p>Great news! The owner of <strong>${boarding?.title || 'the property'}</strong> has approved your visit request.</p>
                            <div style="background-color: #ecfdf5; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #d1fae5;">
                                <p><strong>Date:</strong> ${appointment.date}</p>
                                <p><strong>Time Slot:</strong> ${appointment.timeSlot}</p>
                                <p><strong>Address:</strong> ${boarding?.address || 'See property page'}</p>
                            </div>
                            <p>Please be there on time. If you need to contact the owner, you can find their details on the property page.</p>
                            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                            <p style="text-align: center; color: #94a3b8; font-size: 12px;">© 2026 EasyStay. All rights reserved.</p>
                        </div>
                    `
                });
            } catch (err) {
                console.error('Failed to send approval email:', err);
            }
        }

        // If Rejected, send email to student with reason
        if (status === 'Rejected') {
            try {
                const boarding = await Boarding.findById(appointment.boardingId);
                await sendEmail({
                    email: appointment.userEmail,
                    subject: 'Appointment Update - EasyStay ℹ️',
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                            <h2 style="color: #64748b; text-align: center;">Appointment Status Update</h2>
                            <p>Hi ${appointment.userName},</p>
                            <p>We're writing to inform you that your visit request for <strong>${boarding?.title || 'the property'}</strong> has been declined.</p>
                            <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0;">
                                <p><strong>Date:</strong> ${appointment.date}</p>
                                <p><strong>Time Slot:</strong> ${appointment.timeSlot}</p>
                                <p style="margin-top: 10px; color: #ef4444;"><strong>Reason for Rejection:</strong> ${rejectionReason || 'No specific reason provided.'}</p>
                            </div>
                            <p>You can try booking another time slot or check out other properties on EasyStay.</p>
                            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                            <p style="text-align: center; color: #94a3b8; font-size: 12px;">© 2026 EasyStay. All rights reserved.</p>
                        </div>
                    `
                });
            } catch (err) {
                console.error('Failed to send rejection email:', err);
            }
        }

        res.status(200).json({
            success: true,
            message: `Appointment status updated to ${status}`,
            data: appointment,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update status",
            error: error.message,
        });
    }
};

// ─────────────────────────────────────────────
// @desc    Delete an appointment
// @route   DELETE /api/appointments/:id
// @access  Private (Owner/Admin)
// ─────────────────────────────────────────────
const deleteAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const appointment = await Appointment.findByIdAndDelete(id);

        if (!appointment) {
            return res.status(404).json({ success: false, message: "Appointment not found" });
        }

        res.status(200).json({
            success: true,
            message: "Appointment deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete appointment",
            error: error.message,
        });
    }
};

module.exports = {
    getAvailableSlots,
    bookAppointment,
    updateAppointmentStatus,
    deleteAppointment,
};

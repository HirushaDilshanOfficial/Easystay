const Payment = require('../models/PaymentModel');
const Tenancy = require('../models/TenancyModel');
const Boarding = require('../models/BoardingModel');
const User = require('../models/User');
const sendEmail = require('../utils/emailService');

// @desc    Upload payment slip
// @route   POST /api/payments/upload
// @access  Student
exports.uploadPaymentSlip = async (req, res) => {
    try {
        const { tenancyId, month, amount, useReward } = req.body;
        const student = await User.findById(req.user._id);
        
        if (!req.file) {
            return res.status(400).json({ success: false, message: "Please upload a payment slip image" });
        }

        const tenancy = await Tenancy.findById(tenancyId).populate('boardingId');
        if (!tenancy) {
            return res.status(404).json({ success: false, message: "Tenancy not found" });
        }

        let discountAmount = 0;
        let isRewardUsed = false;
        let ptsToUse = parseInt(req.body.pointsUsed) || 0;

        if (ptsToUse > 0) {
            if (student.loyaltyPoints >= ptsToUse) {
                isRewardUsed = true;
                discountAmount = ptsToUse * 100;
                
                // Deduct points immediately on application
                student.loyaltyPoints -= ptsToUse;
                await student.save();
            } else {
                return res.status(400).json({ success: false, message: `Insufficient loyalty points (${ptsToUse} requested, ${student.loyaltyPoints} available)` });
            }
        }

        const payment = await Payment.create({
            tenancyId,
            studentId: req.user._id,
            ownerId: tenancy.ownerId,
            boardingId: tenancy.boardingId._id,
            amount,
            month,
            slipImage: req.file.path, // Cloudinary URL
            status: 'Pending',
            isRewardUsed,
            pointsUsed: ptsToUse,
            discountAmount
        });

        res.status(201).json({
            success: true,
            data: payment,
            message: "Payment slip uploaded successfully! Waiting for owner approval."
        });
    } catch (error) {
        console.error("Upload slip error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get student's payment history
// @route   GET /api/payments/my-payments
// @access  Student
exports.getStudentPayments = async (req, res) => {
    try {
        const payments = await Payment.find({ studentId: req.user._id })
            .populate('boardingId', 'title address')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: payments.length,
            data: payments
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get owner's tenant payments
// @route   GET /api/payments/owner-payments
// @access  BoardingOwner
exports.getOwnerPayments = async (req, res) => {
    try {
        const payments = await Payment.find({ ownerId: req.user._id })
            .populate('studentId', 'name email phoneNumber')
            .populate('boardingId', 'title address')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: payments.length,
            data: payments
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update payment status
// @route   PUT /api/payments/:id/status
// @access  BoardingOwner
exports.updatePaymentStatus = async (req, res) => {
    try {
        const { status, remarks } = req.body;
        
        let payment = await Payment.findById(req.params.id);

        if (!payment) {
            return res.status(404).json({ success: false, message: "Payment record not found" });
        }

        // Check if owner owns this payment record
        if (payment.ownerId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ success: false, message: "Not authorized to update this record" });
        }

        const previousStatus = payment.status;
        payment.status = status;
        payment.remarks = remarks || payment.remarks;
        await payment.save();

        // If approved and was not approved before, give 1 point to student
        if (status === 'Approved' && previousStatus !== 'Approved') {
            const student = await User.findById(payment.studentId);
            if (student) {
                student.loyaltyPoints += 1;
                await student.save();

                // 1. Send Payment Approved Email
                const boarding = await Boarding.findById(payment.boardingId);
                
                try {
                    await sendEmail({
                        email: student.email,
                        subject: 'EasyStay - Payment Approved! ✅',
                        html: `
                            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                                <h2 style="color: #4f46e5;">Payment Approved</h2>
                                <p>Hello <b>${student.name}</b>,</p>
                                <p>Your payment for <b>${payment.month}</b> for the property <b>${boarding?.title || 'your boarding'}</b> has been approved by the owner.</p>
                                <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
                                    <p style="margin: 5px 0;"><b>Amount:</b> LKR ${payment.amount.toLocaleString()}</p>
                                    <p style="margin: 5px 0;"><b>Status:</b> Approved ✅</p>
                                </div>
                                <p>You have earned <b>1 Loyalty Point</b>! Your total points: <b>${student.loyaltyPoints}</b></p>
                                <p>Thank you for using EasyStay!</p>
                            </div>
                        `
                    });
                } catch (emailErr) {
                    console.error("Failed to send payment approval email:", emailErr);
                }

                // 2. Loyalty Point Milestone (12 Points)
                if (student.loyaltyPoints === 12) {
                    try {
                        await sendEmail({
                            email: student.email,
                            subject: 'EasyStay - Loyalty Reward Ready! 🎁✨',
                            html: `
                                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; text-align: center; border: 2px solid #f59e0b; border-radius: 12px;">
                                    <h2 style="color: #f59e0b;">Congratulations! 🎉</h2>
                                    <p style="font-size: 1.1rem;">You have reached <b>12 Loyalty Points</b>!</p>
                                    <p>As a reward for being a loyal tenant, you have earned a <b>LKR 1,200.00 discount</b> on your next payment.</p>
                                    <div style="background: #fffbeb; padding: 20px; border-radius: 10px; margin: 20px 0;">
                                        <p style="font-size: 1.5rem; font-weight: bold; color: #b45309; margin: 0;">Reward: LKR 1,200 OFF</p>
                                    </div>
                                    <p>You can apply this discount when uploading your next payment slip.</p>
                                    <p>Keep staying with EasyStay! 🏠✨</p>
                                </div>
                            `
                        });
                    } catch (emailErr) {
                        console.error("Failed to send loyalty milestone email:", emailErr);
                    }
                }
            }
        }

        // If rejected and was not rejected before AND a reward was used, refund the points
        if (status === 'Rejected' && previousStatus !== 'Rejected' && payment.isRewardUsed) {
            await User.findByIdAndUpdate(payment.studentId, {
                $inc: { loyaltyPoints: payment.pointsUsed || 0 }
            });
        }

        res.status(200).json({
            success: true,
            data: payment,
            message: `Payment ${status.toLowerCase()} successfully!`
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

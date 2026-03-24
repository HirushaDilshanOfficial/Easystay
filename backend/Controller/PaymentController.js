const Payment = require('../Model/PaymentModel');
const Tenancy = require('../Model/TenancyModel');
const Boarding = require('../Model/BoardingModel');

// @desc    Upload payment slip
// @route   POST /api/payments/upload
// @access  Student
exports.uploadPaymentSlip = async (req, res) => {
    try {
        const { tenancyId, month, amount } = req.body;
        
        if (!req.file) {
            return res.status(400).json({ success: false, message: "Please upload a payment slip image" });
        }

        const tenancy = await Tenancy.findById(tenancyId).populate('boardingId');
        if (!tenancy) {
            return res.status(404).json({ success: false, message: "Tenancy not found" });
        }

        const payment = await Payment.create({
            tenancyId,
            studentId: req.user._id,
            ownerId: tenancy.ownerId,
            boardingId: tenancy.boardingId._id,
            amount,
            month,
            slipImage: req.file.path, // Cloudinary URL
            status: 'Pending'
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

        payment.status = status;
        payment.remarks = remarks || payment.remarks;
        await payment.save();

        res.status(200).json({
            success: true,
            data: payment,
            message: `Payment ${status.toLowerCase()} successfully!`
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

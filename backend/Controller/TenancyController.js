const Tenancy = require("../Model/TenancyModel");
const Boarding = require("../Model/BoardingModel");
const User = require("../models/User");

// @desc    Add a new student tenancy
// @route   POST /api/tenancy/add
// @access  Owner
const addTenancy = async (req, res) => {
    try {
        const { studentEmail, studentName, studentPhone, boardingId, ownerId } = req.body;

        // Check if boarding exists and belongs to owner
        const boarding = await Boarding.findById(boardingId);
        if (!boarding) {
            return res.status(404).json({ success: false, message: "Boarding not found" });
        }

        const tenancy = await Tenancy.create({
            studentEmail,
            studentName,
            studentPhone,
            boardingId,
            ownerId,
        });

        res.status(201).json({
            success: true,
            data: tenancy,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to add tenancy",
            error: error.message,
        });
    }
};

// @desc    Get all tenancies for an owner
// @route   GET /api/tenancy/owner/:ownerId
// @access  Owner
const getOwnerTenancies = async (req, res) => {
    try {
        const { ownerId } = req.params;
        const tenancies = await Tenancy.find({ ownerId, status: "Active" })
            .populate("boardingId", "title address")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: tenancies,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch tenancies",
            error: error.message,
        });
    }
};

// @desc    Get active tenancy for a student
// @route   GET /api/tenancy/my-boarding
// @access  Student
const getStudentTenancy = async (req, res) => {
    try {
        const studentEmail = req.user.email;
        
        const tenancy = await Tenancy.findOne({ studentEmail, status: "Active" })
            .populate("boardingId")
            .populate("ownerId", "name email phoneNumber");

        if (!tenancy) {
            return res.status(200).json({
                success: true,
                data: null,
                message: "No active boarding found for this student email"
            });
        }

        res.status(200).json({
            success: true,
            data: tenancy,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch student tenancy",
            error: error.message,
        });
    }
};

// @desc    Remove or deactivate a tenancy
// @route   DELETE /api/tenancy/:id
// @access  Owner
const removeTenancy = async (req, res) => {
    try {
        const { id } = req.params;
        await Tenancy.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Tenancy removed successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to remove tenancy",
            error: error.message,
        });
    }
};

module.exports = {
    addTenancy,
    getOwnerTenancies,
    getStudentTenancy,
    removeTenancy,
};

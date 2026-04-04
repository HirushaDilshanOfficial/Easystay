const Boarding = require("../models/BoardingModel");
const Appointment = require("../models/AppointmentModel");
const User = require("../models/User");
const sendEmail = require("../utils/emailService");

// ─────────────────────────────────────────────
// @desc    Add a new boarding listing
// @route   POST /api/boardings/add
// @access  Public
// ─────────────────────────────────────────────
const addBoarding = async (req, res) => {
    try {
        console.log("--- New Boarding Request ---");
        console.log("Body:", req.body);
        console.log("Files Field Names:", req.files ? Object.keys(req.files) : "None");

        const {
            title,
            description,
            address,
            distanceFromUniversity,
            pricePerMonth,
            roomType,
            genderType,
            facilities,
            availability,
            rating,
            contactNumber,
            ownerName,
            ownerEmail,
            depositAmount,
        } = req.body;

        let ownerId = req.body.ownerId;
        if (!ownerId || ownerId === "") {
            ownerId = "OWNER-" + Math.random().toString(36).substr(2, 9).toUpperCase();
        }

        // Collect uploaded file paths
        const images = [];
        const videos = [];

        let depositSlip = null;
        let nicPhoto = null;

        if (req.files) {
            // Handle Deposit Slip
            if (req.files['slip'] && req.files['slip'][0]) {
                depositSlip = req.files['slip'][0].path;
            }

            // Handle NIC Photo
            if (req.files['nic'] && req.files['nic'][0]) {
                nicPhoto = req.files['nic'][0].path;
            }

            // Handle Property Media
            if (req.files['media']) {
                req.files['media'].forEach((file) => {
                    // Cloudinary automatically determines format, check mimetype or originalname
                    const isVideo = file.mimetype?.startsWith('video/') || file.originalname.match(/\.(mp4|mov|avi|mkv)$/i);
                    if (isVideo) {
                        videos.push(file.path);
                    } else {
                        images.push(file.path);
                    }
                });
            }
        }

        // Parse facilities if it comes as a string (from form-data)
        const parsedFacilities =
            typeof facilities === "string" ? facilities.split(",").map((f) => f.trim()) : facilities || [];

        const newBoarding = new Boarding({
            title,
            description,
            address,
            distanceFromUniversity,
            pricePerMonth,
            roomType,
            genderType,
            facilities: parsedFacilities,
            availability: availability !== undefined ? availability : true,
            images,
            videos,
            rating: rating || 0,
            contactNumber,
            ownerName,
            ownerId,
            ownerEmail,
            depositAmount: 7499, // Fixed plan
            depositSlip,
            nicPhoto,
            isApproved: false, // Must be approved by admin
        });

        const savedBoarding = await newBoarding.save();
        res.status(201).json({
            success: true,
            message: "Boarding listing added successfully!",
            data: savedBoarding,
        });
    } catch (error) {
        console.error("ADD BOARDING ERROR:", error);
        res.status(500).json({
            success: false,
            message: "Failed to add boarding listing: " + error.message,
            error: error.message,
        });
    }
};

// ─────────────────────────────────────────────
// @desc    Get all boarding listings (with optional filters)
// @route   GET /api/boardings/
// @access  Public
// ─────────────────────────────────────────────
const getAllBoardings = async (req, res) => {
    try {
        const { minPrice, maxPrice, roomType, genderType, facilities, availability, search, maxDistance, adminView } = req.query;

        const filter = {};

        // By default, only show approved boardings
        if (adminView !== "true") {
            filter.isApproved = true;
        }

        // Search filter (locations, campus, keywords in title, description, address)
        if (search) {
            const searchRegex = new RegExp(search, "i"); // case-insensitive
            filter.$or = [
                { title: searchRegex },
                { description: searchRegex },
                { address: searchRegex }
            ];
        }

        // Distance filter
        if (maxDistance) {
            filter.distanceFromUniversity = { $lte: Number(maxDistance) };
        }

        // Price filter
        if (minPrice || maxPrice) {
            filter.pricePerMonth = {};
            if (minPrice) filter.pricePerMonth.$gte = Number(minPrice);
            if (maxPrice) filter.pricePerMonth.$lte = Number(maxPrice);
        }

        // Room type filter
        if (roomType) filter.roomType = roomType;

        // Gender type filter
        if (genderType) filter.genderType = genderType;

        // Facilities filter (comma-separated, e.g., "WiFi,AC")
        if (facilities) {
            const facilitiesArr = facilities.split(",").map((f) => f.trim());
            filter.facilities = { $all: facilitiesArr };
        }

        // Availability filter
        if (availability !== undefined) {
            filter.availability = availability === "true";
        }

        const boardings = await Boarding.find(filter).sort({ rating: -1, createdAt: -1 });

        res.status(200).json({
            success: true,
            count: boardings.length,
            data: boardings,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch boarding listings",
            error: error.message,
        });
    }
};

// ─────────────────────────────────────────────
// @desc    Get a single boarding listing by ID
// @route   GET /api/boardings/:id
// @access  Public
// ─────────────────────────────────────────────
const getBoardingById = async (req, res) => {
    try {
        const boarding = await Boarding.findById(req.params.id);

        if (!boarding) {
            return res.status(404).json({
                success: false,
                message: "Boarding listing not found",
            });
        }

        res.status(200).json({
            success: true,
            data: boarding,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch boarding listing",
            error: error.message,
        });
    }
};

// ─────────────────────────────────────────────
// @desc    Update a boarding listing by ID
// @route   PUT /api/boardings/update/:id
// @access  Public
// ─────────────────────────────────────────────
const updateBoarding = async (req, res) => {
    try {
        const boarding = await Boarding.findById(req.params.id);

        if (!boarding) {
            return res.status(404).json({
                success: false,
                message: "Boarding listing not found",
            });
        }

        // Parse files/arrays if provided as strings (common for form-data)
        if (req.body.facilities && typeof req.body.facilities === "string") {
            req.body.facilities = req.body.facilities.split(",").map((f) => f.trim()).filter(f => f);
        }

        // Handle granular image management (existing vs new)
        let finalImages = [];
        let finalVideos = [];

        // 1. Start with existing images if provided by frontend
        if (req.body.existingImages !== undefined) {
            if (Array.isArray(req.body.existingImages)) {
                finalImages = req.body.existingImages;
            } else if (typeof req.body.existingImages === "string") {
                finalImages = req.body.existingImages.split(",").map(i => i.trim()).filter(i => i);
            } else {
                finalImages = [req.body.existingImages];
            }
        } else if (!req.files || !req.files['media']) {
            // If no existing list sent AND no new files, keep old ones
            finalImages = boarding.images || [];
        }

        // 2. Start with existing videos if provided
        if (req.body.existingVideos !== undefined) {
            if (Array.isArray(req.body.existingVideos)) {
                finalVideos = req.body.existingVideos;
            } else if (typeof req.body.existingVideos === "string") {
                finalVideos = req.body.existingVideos.split(",").map(v => v.trim()).filter(v => v);
            } else {
                finalVideos = [req.body.existingVideos];
            }
        } else if (!req.files || !req.files['media']) {
            finalVideos = boarding.videos || [];
        }

        // 3. Handle newly uploaded files
        if (req.files) {
            const mediaFiles = req.files['media'] || [];
            const slipFiles = req.files['slip'] || [];
            const nicFiles = req.files['nic'] || [];

            mediaFiles.forEach((file) => {
                const isVideo = file.mimetype?.startsWith('video/') || file.originalname.match(/\.(mp4|mov|avi|mkv)$/i);
                if (isVideo) {
                    finalVideos.push(file.path);
                } else {
                    finalImages.push(file.path);
                }
            });

            if (slipFiles.length > 0) req.body.depositSlip = slipFiles[0].path;
            if (nicFiles.length > 0) req.body.nicPhoto = nicFiles[0].path;
        }

        // Set the final arrays back to body for update
        req.body.images = finalImages;
        req.body.videos = finalVideos;

        const updatedBoarding = await Boarding.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: "Boarding listing updated successfully!",
            data: updatedBoarding,
        });
    } catch (error) {
        console.error("UPDATE BOARDING ERROR:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update boarding listing: " + error.message,
            error: error.message,
        });
    }
};

// ─────────────────────────────────────────────
// @desc    Delete a boarding listing by ID
// @route   DELETE /api/boardings/delete/:id
// @access  Public
// ─────────────────────────────────────────────
const deleteBoarding = async (req, res) => {
    try {
        const boarding = await Boarding.findById(req.params.id);

        if (!boarding) {
            return res.status(404).json({
                success: false,
                message: "Boarding listing not found",
            });
        }

        await Boarding.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: "Boarding listing deleted successfully!",
            data: { id: req.params.id },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete boarding listing",
            error: error.message,
        });
    }
};

// ─────────────────────────────────────────────
// @desc    Approve a boarding listing
// @route   PUT /api/boardings/approve/:id
// @access  Admin
// ─────────────────────────────────────────────
const approveBoarding = async (req, res) => {
    try {
        const { message } = req.body; // Accept custom message from admin
        
        const boarding = await Boarding.findByIdAndUpdate(
            req.params.id,
            { isApproved: true },
            { new: true }
        );

        if (!boarding) {
            return res.status(404).json({
                success: false,
                message: "Boarding listing not found",
            });
        }

        if (boarding.ownerEmail) {
            try {
                await sendEmail({
                    email: boarding.ownerEmail,
                    subject: 'Boarding Listing Approved - EasyStay',
                    message: message || `Hello ${boarding.ownerName},\n\nGood news! Your boarding listing "${boarding.title}" has been approved by the admin and is now live on EasyStay.\n\nThank you for using our platform.`
                });
            } catch (emailErr) {
                console.error("Failed to send approval email:", emailErr);
            }
        }

        res.status(200).json({
            success: true,
            message: "Boarding approved successfully!",
            data: boarding,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to approve boarding",
            error: error.message,
        });
    }
};

// ─────────────────────────────────────────────
// @desc    Reject a boarding listing
// @route   PUT /api/boardings/reject/:id
// @access  Admin
// ─────────────────────────────────────────────
const rejectBoarding = async (req, res) => {
    try {
        const { reason, message } = req.body; // Accept custom reason/message from admin
        const boarding = await Boarding.findById(req.params.id);

        if (!boarding) {
            return res.status(404).json({
                success: false,
                message: "Boarding listing not found",
            });
        }

        await Boarding.findByIdAndDelete(req.params.id);

        if (boarding.ownerEmail) {
            try {
                await sendEmail({
                    email: boarding.ownerEmail,
                    subject: 'Boarding Listing Rejected - EasyStay',
                    message: message || `Hello ${boarding.ownerName},\n\nUnfortunately, your boarding listing "${boarding.title}" has been rejected by the admin.\n\nReason: ${reason || 'Does not meet our guidelines.'}\n\nPlease review our policies and try submitting again.`
                });
            } catch (emailErr) {
                console.error("Failed to send rejection email:", emailErr);
            }
        }

        res.status(200).json({
            success: true,
            message: "Boarding rejected and deleted successfully!",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to reject boarding",
            error: error.message,
        });
    }
};

// ─────────────────────────────────────────────
// @desc    Get appointments for an owner's boardings
// @route   GET /api/boardings/owner/appointments/:ownerId
// @access  Owner
// ─────────────────────────────────────────────
const getOwnerAppointments = async (req, res) => {
    try {
        const { ownerId } = req.params;
        console.log("Fetching appointments for ownerId:", ownerId);

        // First, try to find the User to get their email (for legacy OWNER-XXXXXX ID support)
        let ownerEmail = null;
        try {
            // ownerId passed from frontend is the User's _id
            const user = await User.findById(ownerId);
            if (user) {
                ownerEmail = user.email;
                console.log("Found user email for legacy support:", ownerEmail);
            }
        } catch (err) {
            console.log("User not found or invalid ID for email fallback.");
        }

        // Find all boardings by this ownerId OR ownerEmail (if found)
        const query = {
            $or: [{ ownerId }]
        };
        if (ownerEmail) {
            query.$or.push({ ownerEmail });
        }

        const ownerBoardings = await Boarding.find(query);
        console.log("Found boardings count:", ownerBoardings.length);
        const boardingIds = ownerBoardings.map((b) => b._id);

        // Find appointments for these boardings
        const appointments = await Appointment.find({ boardingId: { $in: boardingIds } })
            .populate("boardingId", "title address")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: appointments,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch owner appointments",
            error: error.message,
        });
    }
};

const getOwnerBoardings = async (req, res) => {
    try {
        const { ownerId } = req.params;
        console.log("Fetching boardings for ownerId:", ownerId);

        // First, try to find the User to get their email (for legacy support)
        let ownerEmail = null;
        try {
            const user = await User.findById(ownerId);
            if (user) {
                ownerEmail = user.email;
            }
        } catch (err) {
            console.log("User not found for email mapping.");
        }

        const query = { $or: [{ ownerId }] };
        if (ownerEmail) {
            query.$or.push({ ownerEmail });
        }

        const boardings = await Boarding.find(query).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: boardings,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch owner boardings",
            error: error.message,
        });
    }
};

module.exports = {
    addBoarding,
    getAllBoardings,
    getBoardingById,
    updateBoarding,
    approveBoarding,
    rejectBoarding,
    deleteBoarding,
    getOwnerAppointments,
    getOwnerBoardings,
};

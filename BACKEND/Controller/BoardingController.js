const Boarding = require("../Model/BoardingModel");
const Appointment = require("../Model/AppointmentModel");

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
                depositSlip = req.files['slip'][0].filename;
            }

            // Handle NIC Photo
            if (req.files['nic'] && req.files['nic'][0]) {
                nicPhoto = req.files['nic'][0].filename;
            }

            // Handle Property Media
            if (req.files['media']) {
                req.files['media'].forEach((file) => {
                    const ext = file.originalname.split(".").pop().toLowerCase();
                    const imageExts = ["jpg", "jpeg", "png", "webp"];
                    const videoExts = ["mp4", "mov", "avi", "mkv"];

                    if (imageExts.includes(ext)) {
                        images.push(file.filename);
                    } else if (videoExts.includes(ext)) {
                        videos.push(file.filename);
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
            depositAmount: 7499, // Fixed plan
            depositSlip,
            nicPhoto,
            isApproved: false, // All new listings start as unapproved
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

        const boardings = await Boarding.find(filter).sort({ _id: 1 });

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

        // Parse facilities if provided as string
        if (req.body.facilities && typeof req.body.facilities === "string") {
            req.body.facilities = req.body.facilities.split(",").map((f) => f.trim());
        }

        // Handle newly uploaded files (if any)
        if (req.files) {
            const newImages = [];
            const newVideos = [];

            // Combine all files from all fields (slip, nic, media) for gallery processing if desired
            // Or just process 'media' field for the gallery
            const mediaFiles = req.files['media'] || [];
            const slipFiles = req.files['slip'] || [];
            const nicFiles = req.files['nic'] || [];

            [...mediaFiles, ...slipFiles, ...nicFiles].forEach((file) => {
                const ext = file.originalname.split(".").pop().toLowerCase();
                const imageExts = ["jpg", "jpeg", "png", "webp"];
                const videoExts = ["mp4", "mov", "avi", "mkv"];

                if (imageExts.includes(ext)) {
                    newImages.push(file.filename);
                } else if (videoExts.includes(ext)) {
                    newVideos.push(file.filename);
                }
            });

            if (slipFiles.length > 0) req.body.depositSlip = slipFiles[0].filename;
            if (nicFiles.length > 0) req.body.nicPhoto = nicFiles[0].filename;

            if (newImages.length > 0) req.body.images = [...(boarding.images || []), ...newImages];
            if (newVideos.length > 0) req.body.videos = [...(boarding.videos || []), ...newVideos];
        }

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
// @desc    Get appointments for an owner's boardings
// @route   GET /api/boardings/owner/appointments/:ownerId
// @access  Owner
// ─────────────────────────────────────────────
const getOwnerAppointments = async (req, res) => {
    try {
        const { ownerId } = req.params;
        console.log("Fetching appointments for ownerId:", ownerId);

        // Find all boardings by this ownerId
        const ownerBoardings = await Boarding.find({ ownerId });
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

module.exports = {
    addBoarding,
    getAllBoardings,
    getBoardingById,
    updateBoarding,
    approveBoarding,
    deleteBoarding,
    getOwnerAppointments,
};

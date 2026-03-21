const Boarding = require("../Model/BoardingModel");

// ─────────────────────────────────────────────
// @desc    Add a new boarding listing
// @route   POST /api/boardings/add
// @access  Public
// ─────────────────────────────────────────────
const addBoarding = async (req, res) => {
    try {
        console.log("--- New Boarding Request ---");
        console.log("Body Key Count:", Object.keys(req.body).length);
        console.log("Files Count:", req.files ? req.files.length : 0);

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
        } = req.body;

        // Collect uploaded file paths
        const images = [];
        const videos = [];

        if (req.files) {
            req.files.forEach((file) => {
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
        });

        const savedBoarding = await newBoarding.save();
        res.status(201).json({
            success: true,
            message: "Boarding listing added successfully!",
            data: savedBoarding,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to add boarding listing",
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
        const { minPrice, maxPrice, roomType, genderType, facilities, availability, search } = req.query;

        const filter = {};

        // Search filter (locations, campus, keywords in title, description, address)
        if (search) {
            const searchRegex = new RegExp(search, "i"); // case-insensitive
            filter.$or = [
                { title: searchRegex },
                { description: searchRegex },
                { address: searchRegex }
            ];
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

        const boardings = await Boarding.find(filter).sort({ createdAt: -1 });

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
        if (req.files && req.files.length > 0) {
            const newImages = [];
            const newVideos = [];

            req.files.forEach((file) => {
                const ext = file.originalname.split(".").pop().toLowerCase();
                const imageExts = ["jpg", "jpeg", "png", "webp"];
                const videoExts = ["mp4", "mov", "avi", "mkv"];

                if (imageExts.includes(ext)) {
                    newImages.push(file.filename);
                } else if (videoExts.includes(ext)) {
                    newVideos.push(file.filename);
                }
            });

            req.body.images = [...(boarding.images || []), ...newImages];
            req.body.videos = [...(boarding.videos || []), ...newVideos];
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
        res.status(500).json({
            success: false,
            message: "Failed to update boarding listing",
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

module.exports = {
    addBoarding,
    getAllBoardings,
    getBoardingById,
    updateBoarding,
    deleteBoarding,
};

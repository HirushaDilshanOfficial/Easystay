const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");

const {
    addBoarding,
    getAllBoardings,
    getBoardingById,
    updateBoarding,
    approveBoarding,
    deleteBoarding,
    getOwnerAppointments,
} = require("../Controller/BoardingController");

// ───────────────────────────────────────
// POST   /api/boardings/add        → Add new boarding listing
// GET    /api/boardings/           → Get all boardings (with filters)
// GET    /api/boardings/:id        → Get single boarding by ID
// PUT    /api/boardings/update/:id → Update boarding by ID
// DELETE /api/boardings/delete/:id → Delete boarding by ID
// ───────────────────────────────────────

router.post("/add", upload.array("media", 11), addBoarding); // Increased to 11 to allow for the deposit slip
router.get("/", getAllBoardings);
router.get("/:id", getBoardingById);
router.put("/update/:id", upload.array("media", 10), updateBoarding);
router.put("/approve/:id", approveBoarding);
router.get("/owner/appointments/:ownerName", getOwnerAppointments);
router.delete("/delete/:id", deleteBoarding);

module.exports = router;

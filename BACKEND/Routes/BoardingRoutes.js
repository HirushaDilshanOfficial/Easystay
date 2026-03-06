const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");

const {
    addBoarding,
    getAllBoardings,
    getBoardingById,
    updateBoarding,
    deleteBoarding,
} = require("../Controller/BoardingController");

// ───────────────────────────────────────
// POST   /api/boardings/add        → Add new boarding listing
// GET    /api/boardings/           → Get all boardings (with filters)
// GET    /api/boardings/:id        → Get single boarding by ID
// PUT    /api/boardings/update/:id → Update boarding by ID
// DELETE /api/boardings/delete/:id → Delete boarding by ID
// ───────────────────────────────────────

router.post("/add", upload.array("media", 10), addBoarding);
router.get("/", getAllBoardings);
router.get("/:id", getBoardingById);
router.put("/update/:id", upload.array("media", 10), updateBoarding);
router.delete("/delete/:id", deleteBoarding);

module.exports = router;

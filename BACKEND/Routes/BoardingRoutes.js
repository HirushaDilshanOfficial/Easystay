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
router.post("/add", upload.fields([
    { name: 'slip', maxCount: 1 },
    { name: 'media', maxCount: 10 },
    { name: 'nic', maxCount: 1 }
]), addBoarding);
router.get("/", getAllBoardings);
router.get("/owner/appointments/:ownerId", getOwnerAppointments); // Moved up
router.get("/:id", getBoardingById);
router.put("/update/:id", upload.fields([
    { name: 'slip', maxCount: 1 },
    { name: 'media', maxCount: 10 },
    { name: 'nic', maxCount: 1 }
]), updateBoarding);
router.put("/approve/:id", approveBoarding);
router.delete("/delete/:id", deleteBoarding);

module.exports = router;

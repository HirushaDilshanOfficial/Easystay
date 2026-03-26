const express = require("express");
const router = express.Router();
const { upload } = require("../middlewares/upload");

const {
    addBoarding,
    getAllBoardings,
    getBoardingById,
    updateBoarding,
    approveBoarding,
    rejectBoarding,
    deleteBoarding,
    getOwnerAppointments,
    getOwnerBoardings,
} = require("../controllers/BoardingController");

// ───────────────────────────────────────
router.post("/add", upload.fields([
    { name: 'slip', maxCount: 1 },
    { name: 'media', maxCount: 10 },
    { name: 'nic', maxCount: 1 }
]), addBoarding);
router.get("/", getAllBoardings);
router.get("/owner/appointments/:ownerId", getOwnerAppointments);
router.get("/owner/:ownerId", getOwnerBoardings);
router.get("/:id", getBoardingById);
router.put("/update/:id", upload.fields([
    { name: 'slip', maxCount: 1 },
    { name: 'media', maxCount: 10 },
    { name: 'nic', maxCount: 1 }
]), updateBoarding);
router.put("/approve/:id", approveBoarding);
router.put("/reject/:id", rejectBoarding);
router.delete("/delete/:id", deleteBoarding);

module.exports = router;

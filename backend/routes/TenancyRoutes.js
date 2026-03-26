const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middlewares/authMiddleware");
const {
    addTenancy,
    getOwnerTenancies,
    getStudentTenancy,
    removeTenancy,
} = require("../controllers/TenancyController");

// Owner routes
router.post("/add", protect, authorize("BoardingOwner"), addTenancy);
router.get("/owner/:ownerId", protect, authorize("BoardingOwner"), getOwnerTenancies);
router.delete("/:id", protect, authorize("BoardingOwner"), removeTenancy);

// Student routes
router.get("/my-boarding", protect, authorize("Student"), getStudentTenancy);

module.exports = router;

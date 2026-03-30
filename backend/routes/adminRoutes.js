const express = require("express");
const router = express.Router();

const {
  getAllReviews,
  getSuspiciousReviews,
  approve,
  reject,
  remove,
  suspendUser,
  unsuspendUser,
  getSuspendedUsers,
  ipMonitor,
  stats
} = require("../controllers/adminController");

// REVIEW ROUTES
router.get("/reviews", getAllReviews);
router.get("/reviews/suspicious", getSuspiciousReviews);
router.patch("/reviews/:id/approve", approve);
router.patch("/reviews/:id/reject", reject);
router.delete("/reviews/:id", remove);

// USER ROUTES
router.patch("/users/:id/suspend", suspendUser);
router.patch("/users/:id/unsuspend", unsuspendUser);
router.get("/users/suspended", getSuspendedUsers);

// MONITORING
router.get("/ip-monitor", ipMonitor);
router.get("/stats", stats);

module.exports = router;
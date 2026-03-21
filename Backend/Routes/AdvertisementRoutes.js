const express = require('express');
const router  = express.Router();
const AdvertisementController = require('../Controllers/AdvertisementControllers');

// Public / Boarding Owner routes
router.get("/",          AdvertisementController.getAllAdvertisements);  // ?status=pending|approved|rejected
router.post("/",         AdvertisementController.addAdvertisement);
router.get("/analytics", AdvertisementController.getAnalytics);          // must be BEFORE /:id
router.get("/:id",       AdvertisementController.getById);
router.put("/:id",       AdvertisementController.updateAdvertisement);
router.delete("/:id",    AdvertisementController.deleteAdvertisement);

// Admin-only routes
router.put("/:id/approve", AdvertisementController.approveAdvertisement);
router.put("/:id/reject",  AdvertisementController.rejectAdvertisement);

module.exports = router;

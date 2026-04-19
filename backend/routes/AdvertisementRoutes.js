const express = require('express');
const router  = express.Router();
const AdvertisementController = require('../controllers/AdvertisementControllers');
const { upload } = require('../middlewares/upload');

const adUpload = upload.fields([
    { name: 'imageUrl', maxCount: 1 },
    { name: 'paymentSlip', maxCount: 1 }
]);

// Public / Boarding Owner routes
router.get("/",          AdvertisementController.getAllAdvertisements);  // ?status=pending|approved|rejected
router.post("/",         adUpload, AdvertisementController.addAdvertisement);
router.get("/analytics", AdvertisementController.getAnalytics);          // must be BEFORE /:id
router.get("/:id",       AdvertisementController.getById);
router.put("/:id",       adUpload, AdvertisementController.updateAdvertisement);
router.delete("/:id",    AdvertisementController.deleteAdvertisement);

// Admin-only routes
router.put("/:id/approve", AdvertisementController.approveAdvertisement);
router.put("/:id/reject",  AdvertisementController.rejectAdvertisement);

module.exports = router;
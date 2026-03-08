const express = require('express');
const router = express.Router();
//Insert Model
const Advertisement = require('../models/AdvertisementModel');
//Insert Controller
const AdvertisementController = require('../Controllers/AdvertisementControllers');

router.get("/", AdvertisementController.getAllAdvertisements);
router.post("/", AdvertisementController.addAdvertisement);
router.get("/:id", AdvertisementController.getById);
router.put("/:id", AdvertisementController.updateAdvertisement);
router.delete("/:id", AdvertisementController.deleteAdvertisement);
//export router

module.exports = router;




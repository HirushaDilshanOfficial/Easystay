const express = require('express');
const { signup, login } = require('../controllers/authController');
const { boardingOwnerUpload } = require('../middlewares/upload');

const router = express.Router();

// Apply multer for signup — always, but files only present for BoardingOwner
router.post('/signup', boardingOwnerUpload, signup);
router.post('/login', login);

module.exports = router;

const express = require('express');
const { signup, login, verifyOTP, resendOTP, forgotPassword, resetPassword } = require('../controllers/authController');
const { boardingOwnerUpload } = require('../middlewares/upload');

const router = express.Router();

// Apply multer for signup — always, but files only present for BoardingOwner
router.post('/signup', boardingOwnerUpload, signup);
router.post('/login', login);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;

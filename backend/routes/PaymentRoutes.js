const express = require('express');
const router = express.Router();
const { 
    uploadPaymentSlip, 
    getStudentPayments, 
    getOwnerPayments, 
    updatePaymentStatus 
} = require('../Controller/PaymentController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const { upload } = require('../middlewares/upload');

// All payment routes are protected
router.use(protect);

// Student routes
router.post('/upload', authorize('Student'), upload.single('slipImage'), uploadPaymentSlip);
router.get('/my-payments', authorize('Student'), getStudentPayments);

// Owner routes
router.get('/owner-payments', authorize('BoardingOwner'), getOwnerPayments);
router.put('/:id/status', authorize('BoardingOwner'), updatePaymentStatus);

module.exports = router;

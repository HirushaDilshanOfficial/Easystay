const express = require('express');
const { createReport, getReports, getMyReports, updateReportStatus, deleteReport } = require('../controllers/ReportController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', protect, createReport);
router.get('/my', protect, getMyReports);
router.get('/', protect, authorize('Admin'), getReports);
router.patch('/:id', protect, authorize('Admin'), updateReportStatus);
router.delete('/:id', protect, authorize('Admin'), deleteReport);

module.exports = router;

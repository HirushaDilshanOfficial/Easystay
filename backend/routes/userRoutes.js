const express = require('express');
const {
    getUsers,
    updateUserStatus,
    getAdminStats
} = require('../controllers/userController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

// All routes here are protected and restricted to Admin
router.use(protect);
router.use(authorize('Admin'));

router.get('/', getUsers);
router.get('/stats', getAdminStats);
router.put('/:id/status', updateUserStatus);

module.exports = router;

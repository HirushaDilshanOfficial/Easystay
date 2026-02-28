const express = require('express');
const {
    getUsers,
    updateUserStatus,
    getAdminStats,
    updateUser,
    deleteUser
} = require('../controllers/userController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

// All routes here are protected and restricted to Admin
router.use(protect);
router.use(authorize('Admin'));

router.get('/', getUsers);
router.get('/stats', getAdminStats);
router.put('/:id/status', updateUserStatus);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;

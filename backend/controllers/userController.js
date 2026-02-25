const User = require('../models/User');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
    try {
        const users = await User.find({}).sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Update user status (Approve/Reject)
// @route   PUT /api/users/:id/status
// @access  Private/Admin
exports.updateUserStatus = async (req, res, next) => {
    try {
        const { status } = req.body;

        if (!['Active', 'Pending', 'Rejected', 'Inactive'].includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid status'
            });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get dashboard statistics
// @route   GET /api/users/stats
// @access  Private/Admin
exports.getAdminStats = async (req, res, next) => {
    try {
        const totalUsers = await User.countDocuments();
        const pendingOwners = await User.countDocuments({ role: 'BoardingOwner', status: 'Pending' });
        const activeOwners = await User.countDocuments({ role: 'BoardingOwner', status: 'Active' });
        const totalStudents = await User.countDocuments({ role: 'Student' });

        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                pendingOwners,
                activeOwners,
                totalStudents
            }
        });
    } catch (err) {
        next(err);
    }
};

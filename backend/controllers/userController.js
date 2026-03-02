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
        const { status, rejectionReason } = req.body;

        if (!['Active', 'Pending', 'Rejected', 'Inactive'].includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid status'
            });
        }

        const updateData = { status };
        if (status === 'Rejected' && rejectionReason) {
            updateData.rejectionReason = rejectionReason;
        } else if (status === 'Active') {
            updateData.rejectionReason = null; // Clear if approved
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            updateData,
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

        // User Growth Data (Monthly aggregation for last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1);
        sixMonthsAgo.setHours(0, 0, 0, 0);

        const growthData = await User.aggregate([
            {
                $match: {
                    createdAt: { $gte: sixMonthsAgo }
                }
            },
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        // Format growth data for charts (e.g., { name: 'Jan', users: 7 })
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const formattedGrowth = growthData.map(item => ({
            name: monthNames[item._id - 1],
            users: item.count
        }));

        // Recent Activity (10 most recent registrations/updates)
        const recentActivity = await User.find({})
            .sort({ createdAt: -1 })
            .limit(10)
            .select('name email role status createdAt');

        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                pendingOwners,
                activeOwners,
                totalStudents,
                growthData: formattedGrowth,
                recentActivity
            }
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res, next) => {
    try {
        console.log(`Updating user with ID: ${req.params.id}`);
        console.log('Update data:', req.body);
        const { name, email, phoneNumber, address, role } = req.body;

        const updateData = { name, email, phoneNumber, address, role };

        if (req.file) {
            updateData.facePhoto = req.file.path;
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            updateData,
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

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Prevent admin from deleting themselves
        if (user._id.toString() === req.user.id.toString()) {
            return res.status(400).json({
                success: false,
                error: 'You cannot delete your own account'
            });
        }

        await user.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        next(err);
    }
};

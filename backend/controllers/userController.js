const User = require('../models/User');
const sendEmail = require('../utils/emailService');

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

        // Send email notification if user is a BoardingOwner
        try {
            if (status === 'Active' && user.role === 'BoardingOwner') {
                const html = `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
                        <div style="background-color: #2563eb; padding: 24px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold; letter-spacing: 1px;">EasyStay</h1>
                        </div>
                        <div style="padding: 32px 24px;">
                            <h2 style="color: #1f2937; margin-top: 0; font-size: 22px;">Application Approved! 🎉</h2>
                            <p style="color: #4b5563; line-height: 1.6; font-size: 16px;">Dear ${user.name},</p>
                            <p style="color: #4b5563; line-height: 1.6; font-size: 16px;">Congratulations! Your application to become a Boarding Owner on EasyStay has been reviewed and <strong>approved</strong>.</p>
                            <p style="color: #4b5563; line-height: 1.6; font-size: 16px;">You can now log in to your account and start managing your boarding profile, listing properties, and connecting with students.</p>
                            
                            <div style="text-align: center; margin: 36px 0;">
                                <a href="http://localhost:3000/login" style="background-color: #2563eb; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);">Login to Dashboard</a>
                            </div>
                            
                            <p style="color: #4b5563; line-height: 1.6; font-size: 16px;">Welcome to the EasyStay family! If you have any questions, feel free to reply to this email.</p>
                            
                            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                                <p style="color: #9ca3af; font-size: 14px; line-height: 1.6; margin: 0;">Best regards,<br><strong>The EasyStay Team</strong></p>
                            </div>
                        </div>
                    </div>
                `;
                await sendEmail({
                    email: user.email,
                    subject: 'Your EasyStay Boarding Owner Account is Approved!',
                    html
                });
                console.log(`Approval email sent successfully to ${user.email}`);
            } else if (status === 'Rejected' && user.role === 'BoardingOwner') {
                const html = `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
                        <div style="background-color: #ef4444; padding: 24px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold; letter-spacing: 1px;">EasyStay</h1>
                        </div>
                        <div style="padding: 32px 24px;">
                            <h2 style="color: #1f2937; margin-top: 0; font-size: 22px;">Application Update</h2>
                            <p style="color: #4b5563; line-height: 1.6; font-size: 16px;">Dear ${user.name},</p>
                            <p style="color: #4b5563; line-height: 1.6; font-size: 16px;">We have carefully reviewed your application to become a Boarding Owner on EasyStay. Unfortunately, we are unable to approve your application at this time.</p>
                            
                            <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; margin: 24px 0; border-radius: 0 6px 6px 0;">
                                <p style="color: #991b1b; margin: 0; font-weight: bold; font-size: 15px;">Reason for Rejection:</p>
                                <p style="color: #7f1d1d; margin: 8px 0 0 0; font-size: 15px;">${rejectionReason || 'No specific reason provided. Please ensure all submitted documents meet our requirements and are clearly visible.'}</p>
                            </div>
                            
                            <p style="color: #4b5563; line-height: 1.6; font-size: 16px;">If you believe this is a mistake, or if you would like to provide updated documentation to appeal this decision, please contact our support team.</p>
                            
                            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                                <p style="color: #9ca3af; font-size: 14px; line-height: 1.6; margin: 0;">Best regards,<br><strong>The EasyStay Admin Team</strong></p>
                            </div>
                        </div>
                    </div>
                `;
                await sendEmail({
                    email: user.email,
                    subject: 'Update Regarding Your EasyStay Application',
                    html
                });
                console.log(`Rejection email sent successfully to ${user.email}`);
            }
        } catch (emailError) {
            console.error('Email sending failed during user status update:', emailError);
            // Non-blocking: We catch the error so the status update response still succeeds
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

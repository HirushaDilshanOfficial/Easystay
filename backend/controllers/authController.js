const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET, JWT_EXPIRE } = require('../config/config');
const {
    validateStudentSignup,
    validateBoardingOwnerSignup
} = require('../validators/authValidator');
const sendEmail = require('../utils/emailService');
const crypto = require('crypto');


exports.signup = async (req, res, next) => {
    try {
        const { name, email, password, role, phoneNumber, address } = req.body;

        // Block Admin from registering via public signup
        if (role === 'Admin') {
            return res.status(403).json({
                success: false,
                error: 'Admin accounts cannot be created through public signup.'
            });
        }

        if (role === 'Student') {
            const errors = validateStudentSignup({ name, email, password });
            if (errors.length > 0) {
                return res.status(400).json({ success: false, error: errors[0] });
            }

            const existing = await User.findOne({ email: email.toLowerCase() });
            if (existing) {
                return res.status(400).json({ success: false, error: 'An account with this email already exists.' });
            }

            // Generate OTP
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const otpExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

            const user = await User.create({
                name,
                email,
                password,
                role: 'Student',
                status: 'Active',
                isVerified: false,
                otp,
                otpExpire
            });

            // Send OTP Email
            try {
                await sendEmail({
                    email: user.email,
                    subject: 'Email Verification OTP - Easy Stay',
                    message: `Welcome to Easy Stay, ${user.name}! Your OTP for email verification is: ${otp}. This code will expire in 10 minutes.`,
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                            <h2 style="color: #4a90e2; text-align: center;">Welcome to Easy Stay</h2>
                            <p>Hi ${user.name},</p>
                            <p>Thank you for signing up with Easy Stay. To complete your registration, please use the following OTP to verify your email address:</p>
                            <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; border-radius: 5px; color: #333;">
                                ${otp}
                            </div>
                            <p style="color: #666; font-size: 14px;">This code will expire in 10 minutes.</p>
                            <p>If you didn't create an account, please ignore this email.</p>
                            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                            <p style="text-align: center; color: #999; font-size: 12px;">© 2026 Easy Stay. All rights reserved.</p>
                        </div>
                    `
                });

                return res.status(201).json({
                    success: true,
                    message: 'Verification OTP sent to your email.',
                    email: user.email,
                    role: 'Student',
                    isVerified: false
                });
            } catch (err) {
                console.error('Email send error:', err);
                // Even if email fails, user is created, they can request resend
                return res.status(201).json({
                    success: true,
                    message: 'Account created but failed to send verification email. Please request a resend.',
                    email: user.email,
                    role: 'Student',
                    isVerified: false
                });
            }
        }

        if (role === 'BoardingOwner') {
            const errors = validateBoardingOwnerSignup(
                { name, email, password, phoneNumber, address },
                req.files
            );
            if (errors.length > 0) {
                return res.status(400).json({ success: false, error: errors[0] });
            }

            const existing = await User.findOne({ email: email.toLowerCase() });
            if (existing) {
                return res.status(400).json({ success: false, error: 'An account with this email already exists.' });
            }

            // Cloudinary returns the full URL in path or secure_url
            const nicPhoto = req.files?.nicPhoto?.[0]?.path || null;
            const facePhoto = req.files?.facePhoto?.[0]?.path || null;
            const boardingDocuments = req.files?.boardingDocuments?.map(f => f.path) || [];

            const user = await User.create({
                name,
                email,
                password,
                role: 'BoardingOwner',
                phoneNumber,
                address,
                nicPhoto,
                facePhoto,
                boardingDocuments,
                status: 'Pending'
            });

            return res.status(201).json({
                success: true,
                message: 'Registration submitted. Your account is pending admin approval.',
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    status: user.status
                }
            });
        }

        return res.status(400).json({ success: false, error: 'Invalid role selected.' });
    } catch (err) {
        next(err);
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Please provide email and password.' });
        }

        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
        if (!user) {
            return res.status(401).json({ success: false, error: 'Invalid credentials.' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Invalid credentials.' });
        }

        // Check verification for students
        if (user.role === 'Student' && !user.isVerified) {
            return res.status(403).json({
                success: false,
                isVerified: false,
                error: 'Please verify your email to log in.',
                email: user.email
            });
        }

        // Block pending boarding owners from logging in
        if (user.status === 'Pending') {
            return res.status(403).json({
                success: false,
                error: 'Your account is pending admin approval. Please wait.'
            });
        }

        if (user.status === 'Rejected') {
            return res.status(403).json({
                success: false,
                error: 'Your account registration has been rejected. Please contact support.'
            });
        }

        if (user.status === 'Inactive') {
            return res.status(403).json({
                success: false,
                error: 'Your account has been deactivated. Please contact the administrator.'
            });
        }

        sendTokenResponse(user, 200, res);
    } catch (err) {
        next(err);
    }
};


exports.verifyOTP = async (req, res, next) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ success: false, error: 'Please provide email and OTP.' });
        }

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found.' });
        }

        if (user.isVerified) {
            return res.status(400).json({ success: false, error: 'User is already verified.' });
        }

        if (user.otp !== otp) {
            return res.status(400).json({ success: false, error: 'Invalid OTP.' });
        }

        if (user.otpExpire < Date.now()) {
            return res.status(400).json({ success: false, error: 'OTP has expired. Please request a new one.' });
        }

        user.isVerified = true;
        user.otp = null;
        user.otpExpire = null;
        await user.save();

        sendTokenResponse(user, 200, res);
    } catch (err) {
        next(err);
    }
};


exports.resendOTP = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, error: 'Please provide email.' });
        }

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found.' });
        }

        if (user.isVerified) {
            return res.status(400).json({ success: false, error: 'User is already verified.' });
        }

        // Generate new OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        user.otp = otp;
        user.otpExpire = otpExpire;
        await user.save();

        // Send OTP Email
        await sendEmail({
            email: user.email,
            subject: 'New Verification OTP - Easy Stay',
            message: `Your new OTP for email verification is: ${otp}. This code will expire in 10 minutes.`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <h2 style="color: #4a90e2; text-align: center;">Email Verification</h2>
                    <p>Hi ${user.name},</p>
                    <p>You requested a new OTP for email verification. Please use the following code:</p>
                    <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; border-radius: 5px; color: #333;">
                        ${otp}
                    </div>
                    <p style="color: #666; font-size: 14px;">This code will expire in 10 minutes.</p>
                    <p>If you didn't request this, please ignore this email.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="text-align: center; color: #999; font-size: 12px;">© 2026 Easy Stay. All rights reserved.</p>
                </div>
            `
        });

        res.status(200).json({
            success: true,
            message: 'A new verification OTP has been sent to your email.'
        });
    } catch (err) {
        next(err);
    }
};


exports.forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, error: 'Please provide an email.' });
        }

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found.' });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        user.resetPasswordOTP = otp;
        user.resetPasswordExpire = otpExpire;
        await user.save();

        // Send Email
        try {
            await sendEmail({
                email: user.email,
                subject: 'Password Reset OTP - Easy Stay',
                message: `You requested a password reset. Your OTP is: ${otp}. This code will expire in 10 minutes.`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                        <h2 style="color: #4a90e2; text-align: center;">Reset Your Password</h2>
                        <p>Hi ${user.name},</p>
                        <p>We received a request to reset your password. Use the following code to proceed:</p>
                        <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; border-radius: 5px; color: #333;">
                            ${otp}
                        </div>
                        <p style="color: #666; font-size: 14px;">This code will expire in 10 minutes.</p>
                        <p>If you didn't request this, please change your password immediately or contact support.</p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                        <p style="text-align: center; color: #999; font-size: 12px;">© 2026 Easy Stay. All rights reserved.</p>
                    </div>
                `
            });

            res.status(200).json({
                success: true,
                message: 'Password reset OTP sent to your email.'
            });
        } catch (err) {
            user.resetPasswordOTP = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();
            return res.status(500).json({ success: false, error: 'Email could not be sent.' });
        }
    } catch (err) {
        next(err);
    }
};


exports.resetPassword = async (req, res, next) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword) {
            return res.status(400).json({ success: false, error: 'Please provide email, OTP, and new password.' });
        }

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found.' });
        }

        if (user.resetPasswordOTP !== otp) {
            return res.status(400).json({ success: false, error: 'Invalid OTP.' });
        }

        if (user.resetPasswordExpire < Date.now()) {
            return res.status(400).json({ success: false, error: 'OTP has expired.' });
        }

        // Update password
        user.password = newPassword;
        user.resetPasswordOTP = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password reset successful. You can now log in with your new password.'
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json({
            success: true,
            data: user
        });
    } catch (err) {
        next(err);
    }
};

// Helper: create JWT and send response
const sendTokenResponse = (user, statusCode, res) => {
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
        expiresIn: JWT_EXPIRE
    });

    res.status(statusCode).json({
        success: true,
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
            phoneNumber: user.phoneNumber,
            address: user.address,
            facePhoto: user.facePhoto,
            loyaltyPoints: user.loyaltyPoints,
            createdAt: user.createdAt
        }
    });
};

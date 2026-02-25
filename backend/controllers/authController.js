const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET, JWT_EXPIRE } = require('../config/config');
const {
    validateStudentSignup,
    validateBoardingOwnerSignup
} = require('../validators/authValidator');

// @desc    Register a new user (Student or BoardingOwner only)
// @route   POST /api/auth/signup
// @access  Public
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

            const user = await User.create({ name, email, password, role: 'Student', status: 'Active' });
            return sendTokenResponse(user, 201, res);
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
            status: user.status
        }
    });
};

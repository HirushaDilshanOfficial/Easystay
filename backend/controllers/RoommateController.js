const RoommateProfile = require('../models/RoommateProfile');
const User = require('../models/User');

// @desc    Get current user's roommate profile
// @route   GET /api/roommates/me
// @access  Private
exports.getMyProfile = async (req, res) => {
    try {
        const profile = await RoommateProfile.findOne({ user: req.user._id }).populate('user', 'name email profilePic');
        
        if (!profile) {
            return res.status(404).json({ success: false, message: 'Profile not found' });
        }

        res.status(200).json({ success: true, data: profile });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Create or update roommate profile
// @route   POST /api/roommates
// @access  Private
exports.createOrUpdateProfile = async (req, res) => {
    try {
        const { budget, sleepingHabit, cleanliness, studyPattern, otherDetails, description } = req.body;

        // Simple validation check before DB call
        if (!budget || !sleepingHabit || !cleanliness || !studyPattern) {
            return res.status(400).json({ success: false, message: 'Missing required lifestyle fields (Budget, Sleep, Cleanliness, or Study).' });
        }

        const profileFields = {
            user: req.user?._id || req.user?.id, // Handle both _id and id
            budget: Number(budget),
            sleepingHabit,
            cleanliness,
            studyPattern,
            otherDetails: otherDetails || '',
            description: description || ''
        };

        if (!profileFields.user) {
            return res.status(401).json({ success: false, message: 'User identification failed. Please log out and log in again.' });
        }

        let profile = await RoommateProfile.findOne({ user: profileFields.user });

        if (profile) {
            // Update
            profile = await RoommateProfile.findOneAndUpdate(
                { user: profileFields.user },
                { $set: profileFields },
                { new: true, runValidators: true }
            );
            return res.status(200).json({ success: true, data: profile });
        }

        // Create
        profile = await RoommateProfile.create(profileFields);
        res.status(201).json({ success: true, data: profile });
    } catch (error) {
        console.error('SERVER ERROR IN createOrUpdateProfile:', error);
        res.status(400).json({ success: false, message: `Save Failed: ${error.message}` });
    }
};

// @desc    Get all roommate profiles (Community Board)
// @route   GET /api/roommates/match
// @access  Private
exports.getMatchedRoommates = async (req, res) => {
    try {
        const currentProfile = await RoommateProfile.findOne({ user: req.user._id });

        // Fetch all profiles for the community board
        const otherProfiles = await RoommateProfile.find({}).populate('user', 'name email');

        const communityBoard = [];

        otherProfiles.forEach(profile => {
            let score = 0;
            
            // If current user has a profile, calculate a "Compatibility" hint for the board
            if (currentProfile) {
                // 1. Budget Match (25 points max)
                const budgetDiff = Math.abs(currentProfile.budget - profile.budget);
                const maxBudget = Math.max(currentProfile.budget, profile.budget);
                if (maxBudget > 0) {
                    const budgetScore = 25 * (1 - (budgetDiff / maxBudget));
                    score += Math.max(0, budgetScore);
                } else { score += 25; }

                // 2. Sleeping Habit (25 points)
                if (currentProfile.sleepingHabit === profile.sleepingHabit) score += 25;
                else if (currentProfile.sleepingHabit === 'Flexible' || profile.sleepingHabit === 'Flexible') score += 12;

                // 3. Cleanliness (25 points)
                if (currentProfile.cleanliness === profile.cleanliness) score += 25;
                else if (Math.abs(['Very Clean', 'Average', 'Messy'].indexOf(currentProfile.cleanliness) - ['Very Clean', 'Average', 'Messy'].indexOf(profile.cleanliness)) === 1) score += 12;

                // 4. Study Pattern (25 points)
                if (currentProfile.studyPattern === profile.studyPattern) score += 25;
            }

            communityBoard.push({
                profile,
                matchPercentage: currentProfile ? Math.round(score) : 0
            });
        });

        // Always return the data, sorted by match percentage if a profile exists, otherwise by recency
        if (currentProfile) {
            communityBoard.sort((a, b) => b.matchPercentage - a.matchPercentage);
        } else {
            communityBoard.sort((a, b) => b.profile.createdAt - a.profile.createdAt);
        }

        res.status(200).json({
            success: true,
            count: communityBoard.length,
            data: communityBoard
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

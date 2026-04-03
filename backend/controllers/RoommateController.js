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
        const { budget, sleepingHabit, cleanliness, studyPattern, smokingPreference, gender, description } = req.body;

        const profileFields = {
            user: req.user._id,
            budget,
            sleepingHabit,
            cleanliness,
            studyPattern,
            smokingPreference,
            gender,
            description
        };

        let profile = await RoommateProfile.findOne({ user: req.user._id });

        if (profile) {
            // Update
            profile = await RoommateProfile.findOneAndUpdate(
                { user: req.user._id },
                { $set: profileFields },
                { new: true, runValidators: true }
            );
            return res.status(200).json({ success: true, data: profile });
        }

        // Create
        profile = await RoommateProfile.create(profileFields);
        res.status(201).json({ success: true, data: profile });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message || 'Server Error' });
    }
};

// @desc    Get matched roommates
// @route   GET /api/roommates/match
// @access  Private
exports.getMatchedRoommates = async (req, res) => {
    try {
        const currentProfile = await RoommateProfile.findOne({ user: req.user._id });

        if (!currentProfile) {
            return res.status(400).json({ success: false, message: 'Please create a roommate profile first to find matches.' });
        }

        // Fetch all other profiles
        const otherProfiles = await RoommateProfile.find({ user: { $ne: req.user._id } }).populate('user', 'name email');

        const matches = [];

        otherProfiles.forEach(profile => {
            // Optional: Filter by gender if the current user has a strict preference
            if (currentProfile.gender !== 'Any' && profile.gender !== 'Any' && currentProfile.gender !== profile.gender) {
                return; // Skip this profile
            }

            let score = 0;
            let maxScore = 100;

            // 1. Budget Match (20 points max)
            // If the difference is 0, score is 20. The larger the difference, the lower the score.
            const budgetDiff = Math.abs(currentProfile.budget - profile.budget);
            const maxBudget = Math.max(currentProfile.budget, profile.budget);
            if (maxBudget > 0) {
                const budgetScore = 20 * (1 - (budgetDiff / maxBudget));
                score += Math.max(0, budgetScore);
            } else {
                score += 20;
            }

            // 2. Sleeping Habit Match (20 points)
            if (currentProfile.sleepingHabit === profile.sleepingHabit) {
                score += 20;
            } else if (currentProfile.sleepingHabit === 'Flexible' || profile.sleepingHabit === 'Flexible') {
                score += 10;
            } else {
                score += 0;
            }

            // 3. Cleanliness Match (20 points)
            if (currentProfile.cleanliness === profile.cleanliness) {
                score += 20;
            } else if (
                (currentProfile.cleanliness === 'Very Clean' && profile.cleanliness === 'Average') ||
                (currentProfile.cleanliness === 'Average' && profile.cleanliness === 'Very Clean') ||
                (currentProfile.cleanliness === 'Messy' && profile.cleanliness === 'Average') ||
                (currentProfile.cleanliness === 'Average' && profile.cleanliness === 'Messy')
            ) {
                score += 10;
            } else {
                score += 0; // Very Clean and Messy are 0 compatibility
            }

            // 4. Study Pattern Match (20 points)
            if (currentProfile.studyPattern === profile.studyPattern) {
                score += 20;
            } else if (
                (currentProfile.studyPattern === 'Music OK' && profile.studyPattern === 'Group Study') ||
                (currentProfile.studyPattern === 'Group Study' && profile.studyPattern === 'Music OK')
            ) {
                score += 10;
            } else {
                score += 0;
            }

            // 5. Smoking Preference (20 points)
            if (currentProfile.smokingPreference === profile.smokingPreference) {
                score += 20;
            } else if (currentProfile.smokingPreference === 'No Preference' || profile.smokingPreference === 'No Preference') {
                score += 10;
            } else {
                score += 0; // Smoker and Non-Smoker
            }

            matches.push({
                profile,
                matchPercentage: Math.round(score)
            });
        });

        // Sort by match percentage descending
        matches.sort((a, b) => b.matchPercentage - a.matchPercentage);

        res.status(200).json({
            success: true,
            count: matches.length,
            data: matches
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

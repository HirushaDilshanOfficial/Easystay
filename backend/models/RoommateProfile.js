const mongoose = require('mongoose');

const roommateProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    budget: {
        type: Number,
        required: [true, 'Please provide your maximum budget']
    },
    sleepingHabit: {
        type: String,
        enum: ['Early Bird', 'Night Owl', 'Flexible'],
        required: [true, 'Please provide your sleeping habit']
    },
    cleanliness: {
        type: String,
        enum: ['Very Clean', 'Average', 'Messy'],
        required: [true, 'Please provide your cleanliness level']
    },
    studyPattern: {
        type: String,
        enum: ['Quiet Study', 'Group Study', 'Music OK'],
        required: [true, 'Please provide your study pattern']
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    otherDetails: {
        type: String,
        trim: true,
        default: ''
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('RoommateProfile', roommateProfileSchema);

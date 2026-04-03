const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const RoommateProfile = require('./models/RoommateProfile');

dotenv.config();

const sampleRoommates = [
    {
        name: 'Amara Perera',
        email: 'amara@example.com',
        password: 'password123',
        role: 'Student',
        profile: {
            budget: 15000,
            sleepingHabit: 'Early Bird',
            cleanliness: 'Very Clean',
            studyPattern: 'Quiet Study',
            description: 'First-year SLIIT student. Looking for a quiet and clean place.',
            otherDetails: 'Prefer places near Pittugala. I like gardening and quiet environments.'
        }
    },
    {
        name: 'Kasun Jayawardena',
        email: 'kasun@example.com',
        password: 'password123',
        role: 'Student',
        profile: {
            budget: 12000,
            sleepingHabit: 'Night Owl',
            cleanliness: 'Average',
            studyPattern: 'Music OK',
            description: 'Engineering student at SLIIT.',
            otherDetails: 'I play guitar and stay up late. Looking for chill roommates who don\'t mind a bit of music.'
        }
    },
    {
        name: 'Nimali Silva',
        email: 'nimali@example.com',
        password: 'password123',
        role: 'Student',
        profile: {
            budget: 20000,
            sleepingHabit: 'Flexible',
            cleanliness: 'Very Clean',
            studyPattern: 'Group Study',
            description: 'IT student, very social.',
            otherDetails: 'Looking for a shared apartment with AC. I cook great Sri Lankan food!'
        }
    },
    {
        name: 'Dinesh Fernando',
        email: 'dinesh@example.com',
        password: 'password123',
        role: 'Student',
        profile: {
            budget: 8000,
            sleepingHabit: 'Early Bird',
            cleanliness: 'Average',
            studyPattern: 'Quiet Study',
            description: 'Business student on a budget.',
            otherDetails: 'Just need a basic place to sleep and study. Very quiet person.'
        }
    }
];

const seedRoommates = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for Seeding...');

        const emails = sampleRoommates.map(r => r.email);
        const existingUsers = await User.find({ email: { $in: emails } });
        const existingUserIds = existingUsers.map(u => u._id);
        
        await RoommateProfile.deleteMany({ user: { $in: existingUserIds } });
        await User.deleteMany({ email: { $in: emails } });

        for (const data of sampleRoommates) {
            const user = await User.create({
                name: data.name,
                email: data.email,
                password: data.password,
                role: data.role,
                isVerified: true
            });

            await RoommateProfile.create({
                ...data.profile,
                user: user._id
            });
        }

        console.log('🎉 Sample roommates re-seeded with community board format!');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedRoommates();

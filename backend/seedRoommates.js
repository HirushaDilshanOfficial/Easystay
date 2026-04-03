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
            smokingPreference: 'Non-Smoker',
            gender: 'Female',
            description: 'I am a first-year SLIIT student looking for a quiet and clean place.'
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
            smokingPreference: 'Non-Smoker',
            gender: 'Male',
            description: 'Engineering student, usually up late studying or gaming.'
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
            smokingPreference: 'Non-Smoker',
            gender: 'Female',
            description: 'Looking for a roommate who enjoys group study sessions.'
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
            cleanliness: 'Messy',
            studyPattern: 'Quiet Study',
            smokingPreference: 'Smoker',
            gender: 'Male',
            description: 'Low budget, chill guy.'
        }
    }
];

const seedRoommates = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for Seeding...');

        // Clear existing sample roommate users if any
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

        console.log('🎉 Sample roommates seeded successfully!');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedRoommates();

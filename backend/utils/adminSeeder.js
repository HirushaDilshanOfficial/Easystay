const User = require('../models/User');
const bcrypt = require('bcryptjs');

const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASSWORD = '123456';
const ADMIN_NAME = 'System Admin';

const seedAdmin = async () => {
    try {
        const existingAdmin = await User.findOne({ email: ADMIN_EMAIL, role: 'Admin' });

        if (!existingAdmin) {
            await User.create({
                name: ADMIN_NAME,
                email: ADMIN_EMAIL,
                password: ADMIN_PASSWORD,
                role: 'Admin',
                status: 'Active'
            });
            console.log('✅ Admin account seeded successfully.');
        }
    } catch (err) {
        console.error('❌ Failed to seed admin:', err.message);
    }
};

module.exports = seedAdmin;

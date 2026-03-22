const mongoose = require('mongoose');
const User = require('./models/User');
const { MONGO_URI } = require('./config/config');

(async () => {
    try {
        await mongoose.connect(MONGO_URI);
        const users = await User.find({}).sort({ createdAt: -1 }).limit(5);
        users.forEach(u => console.log(`Email: ${u.email}, Role: ${u.role}, Status: ${u.status}`));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();

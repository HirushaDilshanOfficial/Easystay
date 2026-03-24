const mongoose = require('mongoose');
const User = require('./models/User');
const Boarding = require('./Model/BoardingModel');
const { MONGO_URI } = require('./config/config');

async function checkDb() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');
        
        const targetId = '69a28ce5a80ba8cf95df016b';
        const user = await User.findById(targetId);
        if (user) {
            console.log(`User found: ${user.name}, Email: ${user.email}`);
            
            const boardings = await Boarding.find({
                $or: [{ ownerId: targetId }, { ownerEmail: user.email }]
            });
            console.log(`Related Boardings found: ${boardings.length}`);
            boardings.forEach(b => console.log(`- ${b.title} (ownerId: ${b.ownerId}, ownerEmail: ${b.ownerEmail})`));
        } else {
            console.log(`User NOT found for ID: ${targetId}`);
        }
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkDb();

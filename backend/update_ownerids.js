const mongoose = require("mongoose");
const Boarding = require("./Model/BoardingModel");
require("dotenv").config();

const addOwnerIds = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB...");

        const result = await Boarding.updateMany(
            { ownerId: { $exists: false } }, 
            { $set: { ownerId: "LEGACY_OWNER" } }
        );

        console.log(`Updated ${result.modifiedCount} boardings with ownerId.`);
        process.exit();
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

addOwnerIds();

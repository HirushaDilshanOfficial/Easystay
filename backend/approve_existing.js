const mongoose = require("mongoose");
const Boarding = require("./Model/BoardingModel");
require("dotenv").config();

const approveAll = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB...");

        const result = await Boarding.updateMany(
            { isApproved: { $exists: false } }, 
            { $set: { isApproved: true } }
        );

        console.log(`Updated ${result.modifiedCount} boardings to approved status.`);
        
        // Also ensure existing ones WITH isApproved: false (test data) are approved for now
        const result2 = await Boarding.updateMany(
            { isApproved: false }, 
            { $set: { isApproved: true } }
        );
        console.log(`Updated ${result2.modifiedCount} unapproved boardings to approved.`);

        process.exit();
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

approveAll();

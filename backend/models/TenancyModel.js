const mongoose = require("mongoose");

const tenancySchema = new mongoose.Schema(
    {
        studentEmail: {
            type: String,
            required: [true, "Student email is required"],
            trim: true,
            lowercase: true,
        },
        studentName: {
            type: String,
            trim: true,
        },
        studentPhone: {
            type: String,
            trim: true,
        },
        boardingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Boarding",
            required: [true, "Boarding ID is required"],
        },
        ownerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Owner ID is required"],
        },
        startDate: {
            type: Date,
            default: Date.now,
        },
        status: {
            type: String,
            enum: ["Active", "Past"],
            default: "Active",
        },
    },
    {
        timestamps: true,
    }
);

const Tenancy = mongoose.model("Tenancy", tenancySchema);

module.exports = Tenancy;

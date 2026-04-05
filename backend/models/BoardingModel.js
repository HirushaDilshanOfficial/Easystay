const mongoose = require("mongoose");

const boardingSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Title is required"],
            trim: true,
        },
        description: {
            type: String,
            required: [true, "Description is required"],
            trim: true,
        },
        address: {
            type: String,
            required: [true, "Address is required"],
            trim: true,
        },
        distanceFromUniversity: {
            type: Number,
            required: [true, "Distance from university is required"],
            min: 0,
        },
        pricePerMonth: {
            type: Number,
            required: [true, "Price per month is required"],
            min: 0,
        },
        roomType: {
            type: String,
            enum: ["Single", "Shared"],
            required: [true, "Room type is required"],
        },
        genderType: {
            type: String,
            enum: ["Male", "Female", "Any"],
            required: [true, "Gender type is required"],
        },
        facilities: {
            type: [String],
            enum: ["WiFi", "AC", "Food", "Parking", "CCTV", "Laundry", "Water"],
            default: [],
        },
        availability: {
            type: Boolean,
            default: true,
        },
        images: {
            type: [String],
            default: [],
        },
        videos: {
            type: [String],
            default: [],
        },
        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
        contactNumber: {
            type: String,
            trim: true,
        },
        ownerName: {
            type: String,
            trim: true,
        },
        ownerId: {
            type: String, // Unique ID for owner dashboard access
            required: true,
        },
        ownerEmail: {
            type: String, // Email to notify owner
            trim: true,
        },
        // --- Payment & Admin Fields ---
        depositAmount: {
            type: Number,
            default: 7499, // Standard plan
        },
        depositSlip: {
            type: String, // Filename in uploads folder
        },
        nicPhoto: {
            type: String, // Filename in uploads folder
        },
        isApproved: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

const Boarding = mongoose.model("Boarding", boardingSchema);

module.exports = Boarding;

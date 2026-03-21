const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const advertisementSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    imageUrl: {
        type: String,
        required: false,
    },
    paymentSlip: {
        type: String,
        required: false,
    },
    packageType: {
        type: String,
        enum: ['basic', 'standard', 'premium'],
        required: true,
        default: 'basic',
    },
    // Admin review fields
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
    },
    adminNote: {
        type: String,
        default: '',
    },
    reviewedAt: {
        type: Date,
        default: null,
    },
    date: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model("Advertisement", advertisementSchema);
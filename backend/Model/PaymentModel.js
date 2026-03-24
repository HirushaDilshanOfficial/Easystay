const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    tenancyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tenancy',
        required: true
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    boardingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Boarding',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    month: {
        type: String, // e.g., "March 2026"
        required: true
    },
    paymentDate: {
        type: Date,
        default: Date.now
    },
    slipImage: {
        type: String, // Cloudinary URL
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    remarks: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema);

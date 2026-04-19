const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    reporterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    boardingId: { type: String, required: true },
    reason: { type: String, required: true },
    details: { type: String },
    adminResponse: { type: String, default: '' },
    status: { 
        type: String, 
        enum: ['Pending', 'In-Progress', 'Solved', 'Rejected'], 
        default: 'Pending' 
    }
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);

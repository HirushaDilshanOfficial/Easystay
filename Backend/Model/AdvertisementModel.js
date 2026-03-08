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
        type: String,   // base64 or URL of the uploaded payment slip
        required: false,
    },
    packageType: {
        type: String,
        enum: ['basic', 'standard', 'premium'],
        required: true,
        default: 'basic',
    },
    date: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model("Advertisement", advertisementSchema);
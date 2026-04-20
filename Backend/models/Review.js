const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({

  bookingId: {
    type: String,
    required: true
  },

  studentName: {
    type: String,
    required: true
  },

  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },

  comment: {
    type: String
  },

  anonymous: {
    type: Boolean,
    default: false
  },

  approved: {
    type: Boolean,
    default: false
  },

  createdAt: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model("Review", reviewSchema);
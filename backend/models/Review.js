const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  text: String,
  rating: Number,
  bookingId: String,
  anonymous: Boolean,

  approved: {
    type: Boolean,
    default: false,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Review", reviewSchema);
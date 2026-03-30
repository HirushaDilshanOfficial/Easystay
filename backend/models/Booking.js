const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    bookingId: { type: String, required: true, unique: true, uppercase: true, trim: true },

    // 🔹 TEMP simple (safe)
    student: { type: String, required: true },
    boarding: { type: String, required: true },

    checkInDate: { type: Date, required: true },
    checkOutDate: { type: Date, required: true },

    actualCheckIn: Date,
    actualCheckOut: Date,

    status: {
      type: String,
      enum: ["pending", "confirmed", "checked_in", "completed", "cancelled"],
      default: "pending",
    },

    totalDaysStayed: { type: Number, default: 0 },
    reviewAllowed: { type: Boolean, default: false },
    reviewSubmitted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// 🔹 Eligibility check
bookingSchema.methods.isEligibleForReview = function () {
  const MIN = 1;

  if (this.status !== "completed") {
    return { eligible: false, reason: "Booking must be completed" };
  }

  if (this.reviewSubmitted) {
    return { eligible: false, reason: "Review already submitted" };
  }

  if (this.totalDaysStayed < MIN) {
    return { eligible: false, reason: "Minimum stay not reached" };
  }

  return { eligible: true };
};

// 🔹 Auto calculate days
bookingSchema.pre("save", function (next) {
  if (this.actualCheckIn && this.actualCheckOut) {
    const ms = this.actualCheckOut - this.actualCheckIn;
    this.totalDaysStayed = Math.max(1, Math.ceil(ms / 86400000));
  }

  if (this.status === "completed" && !this.reviewSubmitted) {
    this.reviewAllowed = true;
  }

  next();
});

module.exports = mongoose.model("Booking", bookingSchema);
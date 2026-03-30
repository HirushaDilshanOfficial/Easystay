const mongoose = require("mongoose");

const boardingSchema = new mongoose.Schema(
  {
    name:  { type: String, required: true, trim: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    address: {
      street: String, city: String, district: String, province: String,
    },
    description:   { type: String, trim: true, maxlength: 2000 },
    pricePerMonth: { type: Number, required: true, min: 0 },
    facilities: [String],
    images:     [String],
    isActive:   { type: Boolean, default: true },
    isSuspended:{ type: Boolean, default: false },
    analytics: {
      totalReviews:          { type: Number, default: 0 },
      averageOverall:        { type: Number, default: 0 },
      averageCleanliness:    { type: Number, default: 0 },
      averageSafety:         { type: Number, default: 0 },
      averageOwnerBehavior:  { type: Number, default: 0 },
      averageValueForMoney:  { type: Number, default: 0 },
      starDistribution: {
        1: { type: Number, default: 0 },
        2: { type: Number, default: 0 },
        3: { type: Number, default: 0 },
        4: { type: Number, default: 0 },
        5: { type: Number, default: 0 },
      },
    },
    badge: {
      isTopRated: { type: Boolean, default: false },
      awardedAt:  Date,
    },
  },
  { timestamps: true }
);

// Recalculate analytics from approved reviews array
boardingSchema.methods.recalculateAnalytics = function (reviews) {
  if (!reviews.length) {
    this.analytics = {
      totalReviews: 0, averageOverall: 0, averageCleanliness: 0,
      averageSafety: 0, averageOwnerBehavior: 0, averageValueForMoney: 0,
      starDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };
    this.badge.isTopRated = false;
    return;
  }
  const n = reviews.length;
  const sum = reviews.reduce(
    (a, r) => ({
      overall:       a.overall       + r.ratings.overall,
      cleanliness:   a.cleanliness   + r.ratings.cleanliness,
      safety:        a.safety        + r.ratings.safety,
      ownerBehavior: a.ownerBehavior + r.ratings.ownerBehavior,
      valueForMoney: a.valueForMoney + r.ratings.valueForMoney,
    }),
    { overall: 0, cleanliness: 0, safety: 0, ownerBehavior: 0, valueForMoney: 0 }
  );
  const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  reviews.forEach((r) => { dist[r.ratings.overall] = (dist[r.ratings.overall] || 0) + 1; });

  this.analytics = {
    totalReviews:         n,
    averageOverall:       parseFloat((sum.overall / n).toFixed(2)),
    averageCleanliness:   parseFloat((sum.cleanliness / n).toFixed(2)),
    averageSafety:        parseFloat((sum.safety / n).toFixed(2)),
    averageOwnerBehavior: parseFloat((sum.ownerBehavior / n).toFixed(2)),
    averageValueForMoney: parseFloat((sum.valueForMoney / n).toFixed(2)),
    starDistribution: dist,
  };

  const eligible = this.analytics.averageOverall >= 4.5 && n >= 10;
  if (eligible && !this.badge.isTopRated) {
    this.badge.isTopRated = true;
    this.badge.awardedAt  = new Date();
  } else if (!eligible) {
    this.badge.isTopRated = false;
  }
};

module.exports = mongoose.model("Boarding", boardingSchema);
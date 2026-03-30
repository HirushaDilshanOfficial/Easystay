const Review   = require("../models/Review");
const Boarding = require("../models/Boarding");

exports.updateBoardingAnalytics = async (boardingId) => {
  const reviews = await Review.find({ boarding: boardingId, status: "approved" }).select("ratings");
  const boarding = await Boarding.findById(boardingId);
  if (!boarding) return;
  boarding.recalculateAnalytics(reviews);
  await boarding.save({ validateBeforeSave: false });
};
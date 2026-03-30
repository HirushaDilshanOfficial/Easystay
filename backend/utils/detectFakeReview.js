const Review = require("../models/Review");

const detectFakeReview = async ({ reviewerId, boardingId, ipAddress, comment, ratings }) => {
  const flags  = [];
  let suspicious = false;

  // 1 — Same user, same boarding
  const dup = await Review.findOne({ reviewer: reviewerId, boarding: boardingId });
  if (dup) { flags.push("Duplicate: user already reviewed this boarding."); suspicious = true; }

  // 2 — IP flood: 2+ reviews from same IP on same boarding in 24 h
  const ipCount = await Review.countDocuments({
    "metadata.ipAddress": ipAddress,
    boarding: boardingId,
    createdAt: { $gte: new Date(Date.now() - 86400000) },
  });
  if (ipCount >= 2) { flags.push(`IP abuse: ${ipCount} reviews from this IP in 24 h.`); suspicious = true; }

  // 3 — Too many reviews from same user in 7 days
  const recentCount = await Review.countDocuments({
    reviewer: reviewerId,
    createdAt: { $gte: new Date(Date.now() - 7 * 86400000) },
  });
  if (recentCount >= 5) { flags.push(`High activity: ${recentCount} reviews in 7 days.`); suspicious = true; }

  // 4 — All ratings identical & extreme
  const vals = Object.values(ratings);
  if (vals.every((v) => v === vals[0]) && (vals[0] === 1 || vals[0] === 5))
    flags.push("Suspicious pattern: all ratings identical and extreme.");

  // 5 — Comment quality
  if (comment.trim().split(/\s+/).length < 5) flags.push("Short comment (< 5 words).");
  if (/(.)\1{5,}/.test(comment)) { flags.push("Repetitive characters in comment."); suspicious = true; }

  return { isSuspicious: suspicious, suspicionReasons: flags };
};

module.exports = detectFakeReview;
const jwt  = require("jsonwebtoken");
const User = require("../models/User");

exports.protect = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if (!auth?.startsWith("Bearer "))
      return res.status(401).json({ success: false, message: "Not authenticated." });

    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user)
      return res.status(401).json({ success: false, message: "User no longer exists." });

    if (user.isSuspended)
      return res.status(403).json({
        success: false,
        message: `Account suspended: ${user.suspensionReason || "Policy violation."}`,
      });

    req.user      = user;
    req.clientIP  = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    next();
  } catch {
    res.status(401).json({ success: false, message: "Invalid or expired token." });
  }
};

exports.restrictTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role))
    return res.status(403).json({ success: false, message: "Access denied." });
  next();
};
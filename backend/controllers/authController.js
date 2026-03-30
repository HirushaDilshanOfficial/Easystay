const jwt  = require("jsonwebtoken");
const User = require("../models/User");

const sign = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, studentId, university } = req.body;
    if (await User.findOne({ email }))
      return res.status(409).json({ success: false, message: "Email already registered." });
    const user = await User.create({ name, email, password, role, studentId, university });
    res.status(201).json({ success: true, token: sign(user._id), data: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: "Email and password required." });
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ success: false, message: "Invalid credentials." });
    if (user.isSuspended)
      return res.status(403).json({ success: false, message: `Account suspended: ${user.suspensionReason || "Policy violation."}` });
    res.json({ success: true, token: sign(user._id), data: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMe = (req, res) => res.json({ success: true, data: req.user });
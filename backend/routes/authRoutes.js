// ── authRoutes.js ────────────────────────────────────────────────────────
const express = require("express");
const r = express.Router();
const c = require("../controllers/authController");
const { protect } = require("../middleware/auth");

r.post("/register", c.register);
r.post("/login",    c.login);
r.get ("/me",       protect, c.getMe);

module.exports = r;
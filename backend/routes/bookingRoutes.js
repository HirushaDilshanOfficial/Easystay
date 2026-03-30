const express = require("express");
const r = express.Router();
const c = require("../controllers/bookingController");
const { protect, restrictTo } = require("../middleware/auth");

r.use(protect);
r.post("/",               restrictTo("admin","owner"), c.create);
r.patch("/:id/checkin",   restrictTo("admin","owner"), c.checkIn);
r.patch("/:id/checkout",  restrictTo("admin","owner"), c.checkOut);
r.get ("/verify/:id",     c.verify);
r.get ("/my",             c.myBookings);

module.exports = r;
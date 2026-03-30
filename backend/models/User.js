const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name:      { type: String, required: true, trim: true, maxlength: 100 },
    email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
    password:  { type: String, required: true, minlength: 8, select: false },
    role:      { type: String, enum: ["student", "owner", "admin"], default: "student" },
    studentId: { type: String, trim: true, sparse: true },
    university:{ type: String, trim: true },
    isVerified:   { type: Boolean, default: false },
    isSuspended:  { type: Boolean, default: false },
    suspensionReason: String,
    suspendedAt: Date,
    knownIPs: [String],
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model("User", userSchema);
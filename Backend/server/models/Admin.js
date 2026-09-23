import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    // ==========================
    // Admin Identity
    // ==========================

    firstName: {
      type: String,
      required: [true, "First name is required."],
      trim: true,
    },

    lastName: {
      type: String,
      trim: true,
      default: "",
    },

    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\S+@\S+\.\S+$/,
        "Please provide a valid email address.",
      ],
    },

    // ==========================
    // Password
    // ==========================
    // Bcrypt disabled.
    // Password is stored as plain text for testing.
    //
    // IMPORTANT:
    // This is NOT recommended for production.
    // ==========================

    password: {
      type: String,
      required: [true, "Password is required."],
      minlength: [1, "Password is required."],
      select: false,
    },

    // ==========================
    // Admin Role
    // ==========================

    role: {
      type: String,
      enum: ["admin"],
      default: "admin",
      immutable: true,
    },

    // ==========================
    // Email Verification
    // ==========================
    // Admin accounts are created
    // through the CLI seed script.
    // Therefore admin is verified by default.
    // ==========================

    isVerified: {
      type: Boolean,
      default: true,
    },

    // ==========================
    // Password Reset Fields
    // ==========================

    resetPasswordToken: {
      type: String,
      select: false,
    },

    resetPasswordExpire: {
      type: Date,
      select: false,
    },

    // ==========================
    // Account Lockout Fields
    // ==========================

    failedLoginAttempts: {
      type: Number,
      default: 0,
      select: false,
    },

    lockUntil: {
      type: Date,
      default: null,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

// ==========================
// Admin Model
// ==========================

const Admin = mongoose.model(
  "Admin",
  adminSchema
);

export default Admin;
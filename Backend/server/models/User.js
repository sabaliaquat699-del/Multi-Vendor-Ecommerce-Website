import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // ==========================
    // Core Identity
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

    phone: {
      type: String,
      trim: true,
      default: "",
    },

    profileImage: {
      type: String,
      default: "",
    },

    // ==========================
    // Role
    // ==========================

    role: {
      type: String,
      enum: {
        values: [
          "customer",
          "vendor",
          "admin",
        ],
        message:
          "Role must be either customer, vendor, or admin.",
      },
      default: "customer",
    },

    // ==========================
    // Address
    // ==========================

    address: {
      type: String,
      trim: true,
      default: "",
    },

    city: {
      type: String,
      trim: true,
      default: "",
    },

    country: {
      type: String,
      trim: true,
      default: "",
    },

    // ==========================
    // Vendor Fields
    // ==========================

    storeName: {
      type: String,
      trim: true,
      default: "",
    },

    storeDescription: {
      type: String,
      trim: true,
      default: "",
    },

    businessName: {
      type: String,
      trim: true,
      default: "",
    },

    businessAddress: {
      type: String,
      trim: true,
      default: "",
    },

    vendorStatus: {
      type: String,
      enum: {
        values: [
          "pending",
          "approved",
          "rejected",
        ],
        message:
          "Vendor status must be pending, approved, or rejected.",
      },
    },

    // ==========================
    // Email Verification
    // ==========================

    isVerified: {
      type: Boolean,
      default: false,
    },

    verificationToken: {
      type: String,
      select: false,
    },

    verificationTokenExpire: {
      type: Date,
      select: false,
    },

    // ==========================
    // Password Reset
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
    // Account Lockout
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
// Vendor filtering/index
// ==========================

userSchema.index({
  role: 1,
  vendorStatus: 1,
});

// ==========================
// User Model
// ==========================

const User = mongoose.model(
  "User",
  userSchema
);

export default User;
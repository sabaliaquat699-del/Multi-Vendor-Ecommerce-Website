
import jwt from "jsonwebtoken";

import User from "../models/User.js";
import Customer from "../models/Customer.js";
import Admin from "../models/Admin.js";

// ======================================================
// protect
// ======================================================
// Verifies JWT from Authorization header.
//
// IMPORTANT:
// Vendor accounts are stored in the User collection.
// Therefore vendor authentication must use User.findById()
// instead of Vendor.findById().
//
// Customer accounts may still exist in Customer collection,
// while admin accounts exist in Admin collection.
// ======================================================

export const protect = async (req, res, next) => {
  try {
    // ==========================================
    // CHECK AUTHORIZATION HEADER
    // ==========================================

    const authHeader = req.headers.authorization;

    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. No token provided.",
      });
    }

    // ==========================================
    // GET TOKEN
    // ==========================================

    const token = authHeader
      .split(" ")[1]
      ?.trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. Invalid token.",
      });
    }

    // ==========================================
    // VERIFY JWT
    // ==========================================

    let decoded;

    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message:
            "Session expired. Please log in again.",
        });
      }

      return res.status(401).json({
        success: false,
        message: "Invalid token.",
      });
    }

    // ==========================================
    // GET ID + ROLE FROM TOKEN
    // ==========================================

    const { id, role } = decoded || {};

    if (!id || !role) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload.",
      });
    }

    // ==========================================
    // FIND USER
    // ==========================================

    let user = null;

    // ------------------------------------------------
    // VENDOR
    // ------------------------------------------------
    // Vendors are stored in User collection.
    // ------------------------------------------------

    if (role === "vendor") {
      user = await User.findOne({
        _id: id,
        role: "vendor",
      });
    }

    // ------------------------------------------------
    // CUSTOMER
    // ------------------------------------------------

    else if (role === "customer") {
      user = await Customer.findById(id);
    }

    // ------------------------------------------------
    // ADMIN
    // ------------------------------------------------

    else if (role === "admin") {
      user = await Admin.findById(id);
    }

    // ------------------------------------------------
    // UNKNOWN ROLE
    // ------------------------------------------------

    else {
      return res.status(401).json({
        success: false,
        message: "Unknown role in token.",
      });
    }

    // ==========================================
    // USER NOT FOUND
    // ==========================================

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Account no longer exists.",
      });
    }

    // ==========================================
    // ATTACH USER TO REQUEST
    // ==========================================

    req.user = user;
    req.userRole = role;

    next();
  } catch (error) {
    console.error(
      "AUTH MIDDLEWARE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error during authentication.",
    });
  }
};

// ======================================================
// authorize(...allowedRoles)
// ======================================================
// Use AFTER protect().
//
// Example:
// protect,
// authorize("vendor")
// ======================================================

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.userRole) {
      return res.status(401).json({
        success: false,
        message: "Not authorized.",
      });
    }

    if (!allowedRoles.includes(req.userRole)) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have permission to perform this action.",
      });
    }

    next();
  };
};

// ======================================================
// requireApprovedVendor
// ======================================================
// Vendor-only routes should use:
//
// protect,
// authorize("vendor"),
// requireApprovedVendor
//
// Vendor approval status is stored in User model.
// ======================================================

export const requireApprovedVendor = (
  req,
  res,
  next
) => {
  // ==========================================
  // CHECK VENDOR ROLE
  // ==========================================

  if (req.userRole !== "vendor") {
    return res.status(403).json({
      success: false,
      message: "Vendor access only.",
    });
  }

  // ==========================================
  // CHECK APPROVAL STATUS
  // ==========================================

  if (
    !req.user ||
    req.user.vendorStatus !== "approved"
  ) {
    return res.status(403).json({
      success: false,
      message:
        "Your vendor account is still pending admin approval.",
    });
  }

  next();
};


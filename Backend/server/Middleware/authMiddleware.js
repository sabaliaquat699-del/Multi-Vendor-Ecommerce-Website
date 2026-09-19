import jwt from "jsonwebtoken";
import Customer from "../models/Customer.js";
import Vendor from "../models/Vendor.js";
import Admin from "../models/Admin.js";

// ======================================================
// protect
// Verifies the JWT from the Authorization header,
// re-fetches the user from the correct collection
// (based on role stored in the token), and attaches
// it to req.user. Blocks the request entirely if the
// token is missing, malformed, expired, or the user
// no longer exists.
// ======================================================
export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. No token provided.",
      });
    }

    const token = authHeader.split(" ")[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Session expired. Please log in again.",
        });
      }
      return res.status(401).json({
        success: false,
        message: "Invalid token.",
      });
    }

    const { id, role } = decoded;

    if (!id || !role) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload.",
      });
    }

    let user;
    if (role === "vendor") {
      user = await Vendor.findById(id);
    } else if (role === "customer") {
      user = await Customer.findById(id);
    } else if (role === "admin") {
      user = await Admin.findById(id);
    } else {
      return res.status(401).json({
        success: false,
        message: "Unknown role in token.",
      });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Account no longer exists.",
      });
    }

    req.user = user;
    req.userRole = role;

    next();
  } catch (error) {
    console.error("AUTH MIDDLEWARE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during authentication.",
    });
  }
};

// ======================================================
// authorize(...allowedRoles)
// Use AFTER protect(). Restricts a route to specific
// roles, e.g. authorize("vendor") or authorize("admin").
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
        message: "You do not have permission to perform this action.",
      });
    }

    next();
  };
};

// ======================================================
// requireApprovedVendor
// Extra guard for vendor-only routes (e.g. adding products)
// that should be blocked until admin approves the vendor.
// Use AFTER protect() + authorize("vendor").
// ======================================================
export const requireApprovedVendor = (req, res, next) => {
  if (req.userRole !== "vendor") {
    return res.status(403).json({
      success: false,
      message: "Vendor access only.",
    });
  }

  if (req.user.vendorStatus !== "approved") {
    return res.status(403).json({
      success: false,
      message:
        "Your vendor account is still pending admin approval.",
    });
  }

  next();
};
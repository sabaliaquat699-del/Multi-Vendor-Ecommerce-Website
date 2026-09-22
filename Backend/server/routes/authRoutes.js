import express from "express";

import {
  register,
  login,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
} from "../Controllers/authController.js";

import { protect } from "../Middleware/authMiddleware.js";
import upload from "../Middleware/uploadMiddleware.js";
import {
  mongoSanitize,
  xssClean,
} from "../Middleware/securityMiddleware.js";

import {
  forgotPasswordLimiter,
  resendVerificationLimiter,
  loginLimiter,
  registerLimiter,
} from "../Middleware/rateLimitMiddleware.js";

const router = express.Router();

// ======================================================
// Register
// ======================================================

router.post(
  "/register",
  registerLimiter,
  upload.single("profileImage"),
  mongoSanitize,
  xssClean,
  register
);

// ======================================================
// Login
// ======================================================

router.post(
  "/login",
  loginLimiter,
  login
);

// ======================================================
// Email Verification
// ======================================================

router.post(
  "/verify-email/:token",
  verifyEmail
);

// ======================================================
// Resend Verification
// ======================================================

router.post(
  "/resend-verification",
  resendVerificationLimiter,
  resendVerification
);

// ======================================================
// Forgot Password
// ======================================================

router.post(
  "/forgot-password",
  forgotPasswordLimiter,
  forgotPassword
);

// ======================================================
// Reset Password
// ======================================================

router.post(
  "/reset-password/:token",
  resetPassword
);

// ======================================================
// Current User
// ======================================================

router.get("/me", protect, (req, res) => {
  res.status(200).json({
    success: true,
    role: req.userRole,
    user: req.user,
  });
});

export default router;
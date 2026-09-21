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
import { mongoSanitize, xssClean } from "../Middleware/securityMiddleware.js";
import {
  forgotPasswordLimiter,
  resendVerificationLimiter,
  loginLimiter,
  registerLimiter,
} from "../Middleware/rateLimitMiddleware.js";

const router = express.Router();

// ------------------------------------------------------
// NOTE: register uses multipart/form-data (for the profile
// image), so express.json()'s global body-sanitizer (in
// server.js) never sees this route's fields — multer parses
// them AFTER that middleware runs. That's why mongoSanitize
// and xssClean are attached again here, right after
// upload.single(), so req.body is actually populated when
// they run.
// ------------------------------------------------------

// Customer: register -> verification email sent immediately
// Vendor:   register -> status "pending", NO email until admin approves
router.post(
  "/register",
  registerLimiter,
  upload.single("profileImage"),
  mongoSanitize,
  xssClean,
  register
);

// Blocks login until: customer email verified, or
// vendor approved by admin AND email verified
router.post("/login", loginLimiter, login);

// Called by the frontend VerifyEmail page when the user clicks the email link
// (this is a POST, so the frontend must use POST, not GET)
router.post("/verify-email/:token", verifyEmail);
router.post("/resend-verification", resendVerificationLimiter, resendVerification);

router.post("/forgot-password", forgotPasswordLimiter, forgotPassword);
router.post("/reset-password/:token", resetPassword);

// Example protected route
router.get("/me", protect, (req, res) => {
  res.status(200).json({
    success: true,
    role: req.userRole,
    user: req.user,
  });
});

export default router;
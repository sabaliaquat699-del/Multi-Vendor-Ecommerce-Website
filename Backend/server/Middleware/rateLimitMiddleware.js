import rateLimit from "express-rate-limit";

// ======================================================
// forgotPasswordLimiter
// Max 5 requests per 15 minutes per IP on /forgot-password.
// ======================================================
export const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many password reset requests. Please try again later.",
  },
});

// ======================================================
// resendVerificationLimiter
// Max 5 requests per 15 minutes per IP on /resend-verification.
// ======================================================
export const resendVerificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many verification requests. Please try again later.",
  },
});

// ======================================================
// loginLimiter
// Max 10 login attempts per 15 minutes per IP.
// This is a coarse, IP-based limit that works ALONGSIDE
// the per-account lockout in authController.js (which
// tracks failed attempts per email, regardless of IP).
// Together they stop both "one IP guessing many accounts"
// and "one account guessed from many IPs".
// ======================================================
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many login attempts. Please try again later.",
  },
});

// ======================================================
// registerLimiter
// Max 10 account creations per hour per IP — slows down
// mass fake-account creation / registration spam bots.
// ======================================================
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many accounts created from this network. Please try again later.",
  },
});
import rateLimit from "express-rate-limit";

// ======================================================
// COMMON OPTIONS
// ======================================================

const commonOptions = {
  standardHeaders: true,
  legacyHeaders: false,

  // Vercel / reverse proxy ke Forwarded header
  // validation warning ko disable karta hai.
  validate: {
    forwardedHeader: false,
  },

  // Explicit key generator
  // Is se express-rate-limit ka default
  // forwarded-header validation path use nahi hoga.
  keyGenerator: (req) => {
    return req.ip || "unknown-ip";
  },
};

// ======================================================
// FORGOT PASSWORD
// ======================================================

export const forgotPasswordLimiter = rateLimit({
  ...commonOptions,
  windowMs: 15 * 60 * 1000,
  max: 5,

  message: {
    success: false,
    message:
      "Too many password reset requests. Please try again later.",
  },
});

// ======================================================
// RESEND VERIFICATION
// ======================================================

export const resendVerificationLimiter = rateLimit({
  ...commonOptions,
  windowMs: 15 * 60 * 1000,
  max: 5,

  message: {
    success: false,
    message:
      "Too many verification requests. Please try again later.",
  },
});

// ======================================================
// LOGIN
// ======================================================

export const loginLimiter = rateLimit({
  ...commonOptions,
  windowMs: 15 * 60 * 1000,
  max: 10,

  message: {
    success: false,
    message:
      "Too many login attempts. Please try again later.",
  },
});

// ======================================================
// REGISTER
// ======================================================

export const registerLimiter = rateLimit({
  ...commonOptions,
  windowMs: 60 * 60 * 1000,
  max: 10,

  message: {
    success: false,
    message:
      "Too many accounts created from this network. Please try again later.",
  },
});
import rateLimit from "express-rate-limit";

// ======================================================
// COMMON RATE LIMIT OPTIONS
// ======================================================

const commonOptions = {
  // Rate-limit headers browser/client ko provide honge
  standardHeaders: true,

  // Purane X-RateLimit-* headers disable
  legacyHeaders: false,

  // Vercel reverse proxy ke Forwarded /
  // X-Forwarded-For validation warnings disable.
  //
  // Hum app.js mein:
  // app.set("trust proxy", 1)
  // already use kar rahe hain.
  validate: false,
};

// ======================================================
// FORGOT PASSWORD
// ======================================================

export const forgotPasswordLimiter = rateLimit({
  ...commonOptions,

  // 15 minutes
  windowMs: 15 * 60 * 1000,

  // Maximum 5 requests
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

  // 15 minutes
  windowMs: 15 * 60 * 1000,

  // Maximum 5 requests
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

  // 15 minutes
  windowMs: 15 * 60 * 1000,

  // Maximum 10 login attempts
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

  // 1 hour
  windowMs: 60 * 60 * 1000,

  // Maximum 10 registrations
  max: 10,

  message: {
    success: false,
    message:
      "Too many accounts created from this network. Please try again later.",
  },
});
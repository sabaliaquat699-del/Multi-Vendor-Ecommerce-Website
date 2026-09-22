import rateLimit from "express-rate-limit";

// ======================================================
// COMMON RATE LIMIT OPTIONS
// ======================================================

const commonOptions = {
  standardHeaders: true,
  legacyHeaders: false,

  // Vercel ke Forwarded header validation warning ko
  // disable karta hai.
  validate: {
    forwardedHeader: false,
  },
};

// ======================================================
// FORGOT PASSWORD
// Max 5 requests per 15 minutes per IP
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
// Max 5 requests per 15 minutes per IP
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
// Max 10 login attempts per 15 minutes per IP
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
// Max 10 registrations per hour per IP
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
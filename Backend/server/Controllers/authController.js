import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import Customer from "../models/Customer.js";
import Vendor from "../models/Vendor.js";
import sendEmail from "../utils/sendEmail.js";

// ======================================================
// CONFIG CONSTANTS
// ======================================================
const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const VERIFICATION_TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

// Requires: 1 uppercase, 1 lowercase, 1 number, min 8 chars
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

// ======================================================
// GENERATE TOKEN
// ======================================================
const generateToken = (user, role) => {
  return jwt.sign(
    { id: user._id, role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// ======================================================
// FORMAT USER
// ======================================================
const formatCustomer = (user) => ({
  id: user._id,
  role: "customer",
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  phone: user.phone,
  profileImage: user.profileImage,
  address: user.address,
  city: user.city,
  country: user.country,
  isVerified: user.isVerified,
});

const formatVendor = (user) => ({
  id: user._id,
  role: "vendor",
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  phone: user.phone,
  profileImage: user.profileImage,
  address: user.address,
  city: user.city,
  country: user.country,
  storeName: user.storeName,
  storeDescription: user.storeDescription,
  businessName: user.businessName,
  businessAddress: user.businessAddress,
  vendorStatus: user.vendorStatus,
  isVerified: user.isVerified,
});

// ======================================================
// Helper: check email across both collections
// ======================================================
const emailExistsAnywhere = async (email) => {
  const [existingCustomer, existingVendor] = await Promise.all([
    Customer.findOne({ email }),
    Vendor.findOne({ email }),
  ]);
  return Boolean(existingCustomer || existingVendor);
};

// ======================================================
// Helper: find a user (customer or vendor) by email,
// optionally including hidden fields via `withSelect`.
// ======================================================
const findUserByEmail = async (email, withSelect = "") => {
  let user = await Customer.findOne({ email }).select(withSelect);
  if (user) return { user, role: "customer", Model: Customer };

  user = await Vendor.findOne({ email }).select(withSelect);
  if (user) return { user, role: "vendor", Model: Vendor };

  return { user: null, role: null, Model: null };
};

// ======================================================
// Helper: generate + save a hashed verification token on
// the given user doc, then email the raw (unhashed) token
// as a link. Reused by register() and resendVerification().
// ======================================================
const createAndSendVerificationEmail = async (user) => {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

  user.verificationToken = hashedToken;
  user.verificationTokenExpire = Date.now() + VERIFICATION_TOKEN_EXPIRY_MS;
  await user.save({ validateBeforeSave: false });

  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const verifyUrl = `${clientUrl}/verify-email/${rawToken}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
      <h2>Verify your email</h2>
      <p>Thanks for signing up on NextTech! Please confirm your email address
      to activate your account. This link will expire in <strong>24 hours</strong>.</p>
      <p>
        <a href="${verifyUrl}"
           style="display:inline-block;padding:12px 24px;background:#171717;
                  color:#fff;text-decoration:none;border-radius:8px;">
          Verify Email
        </a>
      </p>
      <p>If you didn't create this account, you can safely ignore this email.</p>
      <p style="color:#888;font-size:12px;">
        Or copy this link: ${verifyUrl}
      </p>
    </div>
  `;

  await sendEmail({
    to: user.email,
    subject: "Verify your NextTech account",
    html,
  });
};

// ======================================================
// REGISTER
// POST /api/auth/register
// ======================================================
export const register = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      role,
      address,
      city,
      country,
      storeName,
      storeDescription,
      businessName,
      businessAddress,
    } = req.body;

    // ----------------------------------------------------
    // TYPE SAFETY — reject anything that isn't a plain
    // string for email/password. Without this, MongoDB
    // queries built from these values could be manipulated
    // with objects like { "$ne": null } (NoSQL injection).
    // ----------------------------------------------------
    if (typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid request format.",
      });
    }

    if (!firstName?.trim() || !email.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: "First name, email and password are required.",
      });
    }

    // ---- Password complexity ----
    if (!PASSWORD_REGEX.test(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters and include an uppercase letter, a lowercase letter, and a number.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const finalRole = role === "vendor" ? "vendor" : "customer";

    if (finalRole === "vendor" && !storeName?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Store name is required for vendor accounts.",
      });
    }

    const alreadyExists = await emailExistsAnywhere(normalizedEmail);
    if (alreadyExists) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const profileImage = req.file
      ? `/uploads/profile-images/${req.file.filename}`
      : "";

    const baseData = {
      firstName: firstName.trim(),
      lastName: lastName?.trim() || "",
      email: normalizedEmail,
      phone: phone?.trim() || "",
      password: hashedPassword,
      address: address?.trim() || "",
      city: city?.trim() || "",
      country: country?.trim() || "",
      profileImage,
      isVerified: false, // account is INACTIVE until email is verified
    };

    let savedUser;

    if (finalRole === "vendor") {
      savedUser = await Vendor.create({
        ...baseData,
        storeName: storeName.trim(),
        storeDescription: storeDescription?.trim() || "",
        businessName: businessName?.trim() || "",
        businessAddress: businessAddress?.trim() || "",
        vendorStatus: "pending",
      });
    } else {
      savedUser = await Customer.create(baseData);
    }

    // ---- Send verification email (best-effort) ----
    try {
      await createAndSendVerificationEmail(savedUser);
    } catch (emailError) {
      console.error("SEND VERIFICATION EMAIL ERROR:", emailError);
      // Account is still created — user can request a new link
      // via /api/auth/resend-verification if this email failed.
    }

    return res.status(201).json({
      success: true,
      requiresVerification: true,
      message:
        finalRole === "vendor"
          ? "Registered successfully! Please check your email to verify your account. Your vendor account will also need admin approval before you can start selling."
          : "Registered successfully! Please check your email to verify your account before logging in.",
      email: normalizedEmail,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    if (error.name === "ValidationError") {
      const firstError = Object.values(error.errors)[0]?.message;
      return res.status(400).json({
        success: false,
        message: firstError || "Validation error during registration.",
      });
    }

    console.error("REGISTER ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during registration.",
    });
  }
};

// ======================================================
// VERIFY EMAIL
// POST /api/auth/verify-email/:token
//
// Hashes the raw token from the URL and compares it against
// the hashed token stored in DB (same pattern as password
// reset) — the raw token is never stored anywhere. On success,
// the account is activated AND a login JWT is issued so the
// frontend can drop the user straight into their dashboard.
// ======================================================
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token || typeof token !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid verification link.",
      });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    let user = await Customer.findOne({
      verificationToken: hashedToken,
      verificationTokenExpire: { $gt: Date.now() },
    }).select("+verificationToken +verificationTokenExpire");

    let role = "customer";

    if (!user) {
      user = await Vendor.findOne({
        verificationToken: hashedToken,
        verificationTokenExpire: { $gt: Date.now() },
      }).select("+verificationToken +verificationTokenExpire");
      role = "vendor";
    }

    if (!user) {
      return res.status(400).json({
        success: false,
        message:
          "This verification link is invalid or has expired. Please request a new one.",
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpire = undefined;
    await user.save({ validateBeforeSave: false });

    const token_ = generateToken(user, role);

    return res.status(200).json({
      success: true,
      message: "Email verified successfully! You are now logged in.",
      token: token_,
      user: role === "vendor" ? formatVendor(user) : formatCustomer(user),
    });
  } catch (error) {
    console.error("VERIFY EMAIL ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while verifying email.",
    });
  }
};

// ======================================================
// RESEND VERIFICATION EMAIL
// POST /api/auth/resend-verification
//
// Always returns the same generic message regardless of
// whether the email exists or is already verified — this
// prevents email enumeration, same pattern as forgotPassword.
// ======================================================
export const resendVerification = async (req, res) => {
  const genericResponse = {
    success: true,
    message:
      "If an account with that email exists and is not yet verified, a new verification link has been sent.",
  };

  try {
    const { email } = req.body;

    if (typeof email !== "string" || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const { user } = await findUserByEmail(normalizedEmail);

    if (user && !user.isVerified) {
      try {
        await createAndSendVerificationEmail(user);
      } catch (emailError) {
        console.error("RESEND VERIFICATION EMAIL ERROR:", emailError);
      }
    }

    return res.status(200).json(genericResponse);
  } catch (error) {
    console.error("RESEND VERIFICATION ERROR:", error);
    return res.status(200).json(genericResponse);
  }
};

// ======================================================
// LOGIN
// POST /api/auth/login
//
// SECURITY: implements per-account lockout on top of the
// IP-based rate limiter in rateLimitMiddleware.js, PLUS an
// email-verification gate. Order of checks matters:
//   1) account lock check
//   2) password check (wrong password -> always generic 401,
//      regardless of verification status, to avoid leaking
//      whether an email is registered/verified)
//   3) only AFTER password is confirmed correct do we check
//      isVerified, so an attacker guessing emails learns
//      nothing without already knowing the password.
// ======================================================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid request format.",
      });
    }

    if (!email.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const { user, role } = await findUserByEmail(
      normalizedEmail,
      "+password +failedLoginAttempts +lockUntil"
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // ---- Check if account is currently locked ----
    if (user.lockUntil && user.lockUntil > Date.now()) {
      const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(423).json({
        success: false,
        message: `Too many failed attempts. Please try again in ${minutesLeft} minute(s).`,
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;

      if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
        user.lockUntil = new Date(Date.now() + LOCK_DURATION_MS);
        user.failedLoginAttempts = 0;
      }

      await user.save({ validateBeforeSave: false });

      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // ---- Correct password from here on: reset lockout state ----
    if (user.failedLoginAttempts > 0 || user.lockUntil) {
      user.failedLoginAttempts = 0;
      user.lockUntil = null;
      await user.save({ validateBeforeSave: false });
    }

    // ---- Email verification gate ----
    // Account stays inactive until the user clicks the
    // verification link sent to their inbox.
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        notVerified: true,
        message:
          "Please verify your email before logging in. Check your inbox for the verification link, or request a new one.",
      });
    }

    const token = generateToken(user, role);

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: role === "vendor" ? formatVendor(user) : formatCustomer(user),
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during login.",
    });
  }
};

// ======================================================
// FORGOT PASSWORD
// POST /api/auth/forgot-password
// ======================================================
export const forgotPassword = async (req, res) => {
  const genericResponse = {
    success: true,
    message:
      "If an account with that email exists, a password reset link has been sent.",
  };

  try {
    const { email } = req.body;

    if (typeof email !== "string" || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const { user } = await findUserByEmail(normalizedEmail);

    if (user) {
      const rawToken = crypto.randomBytes(32).toString("hex");
      const hashedToken = crypto
        .createHash("sha256")
        .update(rawToken)
        .digest("hex");

      user.resetPasswordToken = hashedToken;
      user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
      await user.save({ validateBeforeSave: false });

      const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
      const resetUrl = `${clientUrl}/reset-password/${rawToken}`;

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
          <h2>Reset your password</h2>
          <p>We received a request to reset your NextTech account password.
          This link will expire in <strong>15 minutes</strong>.</p>
          <p>
            <a href="${resetUrl}"
               style="display:inline-block;padding:12px 24px;background:#171717;
                      color:#fff;text-decoration:none;border-radius:8px;">
              Reset Password
            </a>
          </p>
          <p>If you didn't request this, you can safely ignore this email —
          your password will not be changed.</p>
          <p style="color:#888;font-size:12px;">
            Or copy this link: ${resetUrl}
          </p>
        </div>
      `;

      try {
        await sendEmail({
          to: user.email,
          subject: "Reset your NextTech password",
          html,
        });
      } catch (emailError) {
        console.error("SEND RESET EMAIL ERROR:", emailError);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
      }
    }

    return res.status(200).json(genericResponse);
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);
    return res.status(200).json(genericResponse);
  }
};

// ======================================================
// RESET PASSWORD
// POST /api/auth/reset-password/:token
// ======================================================
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing reset token.",
      });
    }

    if (typeof password !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid request format.",
      });
    }

    if (!PASSWORD_REGEX.test(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters and include an uppercase letter, a lowercase letter, and a number.",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match.",
      });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    let user = await Customer.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    }).select("+resetPasswordToken +resetPasswordExpire");

    if (!user) {
      user = await Vendor.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpire: { $gt: Date.now() },
      }).select("+resetPasswordToken +resetPasswordExpire");
    }

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "This reset link is invalid or has expired.",
      });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    // Also clear any lockout state — a successful password
    // reset is a legitimate account-recovery action.
    user.failedLoginAttempts = 0;
    user.lockUntil = null;

    await user.save();

    return res.status(200).json({
      success: true,
      message:
        "Password reset successfully. You can now log in with your new password.",
    });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while resetting password.",
    });
  }
};
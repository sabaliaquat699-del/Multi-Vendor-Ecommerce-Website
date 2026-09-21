import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import Customer from "../models/Customer.js";
import Vendor from "../models/Vendor.js";
import Admin from "../models/Admin.js";
import sendEmail from "../utils/sendEmail.js";

// ======================================================
// CONFIG CONSTANTS
// ======================================================
const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const VERIFICATION_TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

// NEW: frontend ka default URL (Vite 5174 par chal raha hai)
const DEFAULT_CLIENT_URL = "http://localhost:5174";

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

const formatAdmin = (user) => ({
  id: user._id,
  role: "admin",
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  isVerified: user.isVerified,
});

// ======================================================
// Helper: check email across all three collections
// ======================================================
const emailExistsAnywhere = async (email) => {
  const [existingCustomer, existingVendor, existingAdmin] = await Promise.all([
    Customer.findOne({ email }),
    Vendor.findOne({ email }),
    Admin.findOne({ email }),
  ]);
  return Boolean(existingCustomer || existingVendor || existingAdmin);
};

// ======================================================
// Helper: find a user (customer, vendor, or admin) by
// email, optionally including hidden fields via `withSelect`.
// ======================================================
const findUserByEmail = async (email, withSelect = "") => {
  let user = await Customer.findOne({ email }).select(withSelect);
  if (user) return { user, role: "customer", Model: Customer };

  user = await Vendor.findOne({ email }).select(withSelect);
  if (user) return { user, role: "vendor", Model: Vendor };

  user = await Admin.findOne({ email }).select(withSelect);
  if (user) return { user, role: "admin", Model: Admin };

  return { user: null, role: null, Model: null };
};

// ======================================================
// Helper: generate + save a hashed verification token on
// the given user doc, then email the raw (unhashed) token
// as a link. Reused by register() (customers),
// resendVerification(), and the ADMIN approve-vendor route.
//
// CHANGED: ab yeh export hai, aur `approved: true` dene par
// email ka text "vendor account approved" wala ho jata hai.
// ======================================================
export const createAndSendVerificationEmail = async (
  user,
  { approved = false } = {}
) => {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

  user.verificationToken = hashedToken;
  user.verificationTokenExpire = Date.now() + VERIFICATION_TOKEN_EXPIRY_MS;
  await user.save({ validateBeforeSave: false });

  const clientUrl = process.env.CLIENT_URL || DEFAULT_CLIENT_URL;
  const verifyUrl = `${clientUrl}/verify-email/${rawToken}`;

  // CHANGED: approve hone wali email ka alag intro
  const intro = approved
    ? `Great news! Your vendor account has been <strong>approved</strong> by our admin.
       Please confirm your email address to activate your account and start selling.
       This link will expire in <strong>24 hours</strong>.`
    : `Thanks for signing up on NextTech! Please confirm your email address
       to activate your account. This link will expire in <strong>24 hours</strong>.`;

  const subject = approved
    ? "Your NextTech vendor account is approved - verify your email"
    : "Verify your NextTech account";

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
      <h2>Verify your email</h2>
      <p>${intro}</p>
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
    subject,
    html,
  });

  // NEW: email chali gayi, terminal mein confirm karein
  console.log("VERIFICATION EMAIL SENT TO:", user.email);

  // NEW: testing ke liye link terminal mein (production mein print nahi hoga)
  if (process.env.NODE_ENV !== "production") {
    console.log("VERIFY LINK:", verifyUrl);
  }
};

// ======================================================
// REGISTER
// POST /api/auth/register
//
// NOTE: `role` from the client is only ever mapped to
// "vendor" or "customer" below — there is no code path
// here that can create an "admin" account. Admins are
// created exclusively via server/scripts/createAdmin.js.
//
// CHANGED:
//  - Customer -> verification email foran jati hai.
//  - Vendor   -> status "pending", koi email nahi. Email
//                admin ke approve karne ke baad jayegi.
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
      isVerified: false,
    };

    // ---------------- VENDOR ----------------
    if (finalRole === "vendor") {
      await Vendor.create({
        ...baseData,
        storeName: storeName.trim(),
        storeDescription: storeDescription?.trim() || "",
        businessName: businessName?.trim() || "",
        businessAddress: businessAddress?.trim() || "",
        vendorStatus: "pending",
      });

      // CHANGED: vendor ko yahan email NAHI bheji jati
      return res.status(201).json({
        success: true,
        requiresVerification: false,
        pendingApproval: true,
        message:
          "Registered successfully! Your vendor account is waiting for admin approval. Once approved, you will receive an email to verify your account and log in.",
        email: normalizedEmail,
      });
    }

    // ---------------- CUSTOMER ----------------
    const savedUser = await Customer.create(baseData);

    try {
      await createAndSendVerificationEmail(savedUser);
    } catch (emailError) {
      console.error(
        "SEND VERIFICATION EMAIL ERROR:",
        emailError.code,
        emailError.message
      );
    }

    return res.status(201).json({
      success: true,
      requiresVerification: true,
      pendingApproval: false,
      message:
        "Registered successfully! Please check your email to verify your account before logging in.",
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
// (Admins never go through this — they're pre-verified.)
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

    // CHANGED: agar vendor abhi approved nahi hai (jaise purane flow ka
    // token), to verify na hone dein aur login token bhi na dein.
    if (role === "vendor" && user.vendorStatus !== "approved") {
      return res.status(403).json({
        success: false,
        pendingApproval: true,
        message:
          "Your vendor account is still waiting for admin approval. You will receive a new verification email once it is approved.",
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
    // CHANGED: ab `role` bhi le rahe hain
    const { user, role } = await findUserByEmail(normalizedEmail);

    // NEW: terminal mein saaf nazar aaye ke email kyun gayi ya nahi gayi
    if (!user) {
      console.log("RESEND: account not found for", normalizedEmail);
    } else if (user.isVerified) {
      console.log("RESEND: already verified, email not sent to", normalizedEmail);
    }

    if (user && !user.isVerified) {
      // CHANGED: vendor ko email tabhi jayegi jab admin approve kar chuka ho
      const vendorNotApproved =
        role === "vendor" && user.vendorStatus !== "approved";

      if (vendorNotApproved) {
        console.log("RESEND: vendor not approved yet, email not sent to", normalizedEmail);
      } else {
        try {
          await createAndSendVerificationEmail(user);
        } catch (emailError) {
          console.error(
            "RESEND VERIFICATION EMAIL ERROR:",
            emailError.code,
            emailError.message
          );
        }
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
// Works for customer, vendor AND admin — role is looked
// up automatically via findUserByEmail() across all three
// collections, so admins log in through this same endpoint
// and the frontend already redirects role === "admin" to
// /admin.
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

    if (user.failedLoginAttempts > 0 || user.lockUntil) {
      user.failedLoginAttempts = 0;
      user.lockUntil = null;
      await user.save({ validateBeforeSave: false });
    }

    // CHANGED: vendor ke liye pehle admin approval check hota hai
    if (role === "vendor") {
      if (user.vendorStatus === "rejected") {
        return res.status(403).json({
          success: false,
          rejected: true,
          message:
            "Your vendor application was not approved. Please contact support for more information.",
        });
      }

      if (user.vendorStatus !== "approved") {
        return res.status(403).json({
          success: false,
          pendingApproval: true,
          message:
            "Your vendor account is waiting for admin approval. You will receive an email once it is approved.",
        });
      }
    }

    // Customer: email verify hona zaroori.
    // Vendor: approve ho chuka hai, ab email verify hona zaroori.
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        notVerified: true,
        message:
          "Please verify your email before logging in. Check your inbox for the verification link, or request a new one.",
      });
    }

    const token = generateToken(user, role);

    const formattedUser =
      role === "vendor"
        ? formatVendor(user)
        : role === "admin"
        ? formatAdmin(user)
        : formatCustomer(user);

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: formattedUser,
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
// (Works for admins too, via findUserByEmail.)
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

      const clientUrl = process.env.CLIENT_URL || DEFAULT_CLIENT_URL;
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
        console.log("RESET EMAIL SENT TO:", user.email); // NEW
      } catch (emailError) {
        console.error(
          "SEND RESET EMAIL ERROR:",
          emailError.code,
          emailError.message
        );
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
      user = await Admin.findOne({
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
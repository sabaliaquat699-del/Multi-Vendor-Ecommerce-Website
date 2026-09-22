import crypto from "crypto";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import User from "../models/User.js";
import Admin from "../models/Admin.js";
import sendEmail from "../utils/sendEmail.js";

// ======================================================
// Generate JWT
// ======================================================

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

// ======================================================
// Generate Verification Token
// ======================================================

const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

// ======================================================
// Hash Verification Token
// ======================================================

const hashToken = (token) => {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
};

// ======================================================
// REGISTER
// ======================================================

export const register = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      confirmPassword,
      address,
      city,
      country,
      role,
      storeName,
      storeDescription,
      businessName,
      businessAddress,
    } = req.body;

    // ------------------------------------------
    // Required fields
    // ------------------------------------------

    if (
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !password ||
      !confirmPassword
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields.",
      });
    }

    // ------------------------------------------
    // Password confirmation
    // ------------------------------------------

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match.",
      });
    }

    // ------------------------------------------
    // Vendor-specific required field
    // ------------------------------------------

    if (role === "vendor" && !storeName) {
      return res.status(400).json({
        success: false,
        message: "Store name is required for vendor accounts.",
      });
    }

    // ------------------------------------------
    // Check existing user
    // ------------------------------------------

    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    // ------------------------------------------
    // Validate role
    // ------------------------------------------

    const userRole =
      role === "vendor" ? "vendor" : "customer";

    // ------------------------------------------
    // Hash password
    // ------------------------------------------

    const hashedPassword = await bcrypt.hash(password, 12);

    // ------------------------------------------
    // Create user
    // ------------------------------------------

    const userData = {
      firstName,
      lastName,
      email: email.toLowerCase(),
      phone,
      password: hashedPassword,
      address,
      city,
      country,
      role: userRole,

      isVerified: false,

      profileImage: req.file
        ? req.file.path
        : null,
    };

    // ------------------------------------------
    // Vendor starts as pending
    // ------------------------------------------

    if (userRole === "vendor") {
      userData.vendorStatus = "pending";

      userData.storeName = storeName || "";
      userData.storeDescription = storeDescription || "";
      userData.businessName = businessName || "";
      userData.businessAddress = businessAddress || "";

      // Vendor does NOT get verification
      // email during registration.
      userData.verificationToken = null;
      userData.verificationTokenExpire = null;
    }

    // ------------------------------------------
    // Customer verification token
    // ------------------------------------------

    if (userRole === "customer") {
      const verificationToken =
        generateVerificationToken();

      userData.verificationToken =
        hashToken(verificationToken);

      userData.verificationTokenExpire =
        new Date(Date.now() + 24 * 60 * 60 * 1000);

      const user = await User.create(userData);

      // ----------------------------------------
      // Customer verification email
      // ----------------------------------------

      const frontendUrl =
        process.env.FRONTEND_URL ||
        "http://localhost:5173";

      const verificationUrl =
        `${frontendUrl}/verify-email/${verificationToken}`;

      try {
        await sendEmail({
          to: user.email,
          subject: "Verify Your Email",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">

              <h2>Verify Your Email</h2>

              <p>Hello ${user.firstName},</p>

              <p>
                Thank you for registering with ElectroMarket.
              </p>

              <p>
                Please click the button below to verify your email address.
              </p>

              <div style="margin: 30px 0;">
                <a
                  href="${verificationUrl}"
                  style="
                    display: inline-block;
                    padding: 12px 24px;
                    background: #171717;
                    color: white;
                    text-decoration: none;
                    border-radius: 6px;
                  "
                >
                  Verify Email
                </a>
              </div>

              <p>
                This verification link will expire in 24 hours.
              </p>

            </div>
          `,
        });
      } catch (emailError) {
        console.error(
          "Customer verification email error:",
          emailError
        );
      }

      return res.status(201).json({
        success: true,
        pendingApproval: false,
        message:
          "Customer registered successfully. Please check your email to verify your account.",
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
        },
      });
    }

    // ------------------------------------------
    // Vendor registration
    // ------------------------------------------

    const vendor = await User.create(userData);

    return res.status(201).json({
      success: true,
      pendingApproval: true,
      message:
        "Vendor registered successfully. Your account is pending admin approval.",
      user: {
        id: vendor._id,
        firstName: vendor.firstName,
        lastName: vendor.lastName,
        email: vendor.email,
        role: vendor.role,
        vendorStatus: vendor.vendorStatus,
        isVerified: vendor.isVerified,
      },
    });
  } catch (error) {
    console.error("Register error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during registration.",
      error: error.message,
    });
  }
};

// ======================================================
// LOGIN
// ======================================================

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const normalizedEmail = email.toLowerCase();

    // ------------------------------------------
    // Pehle Admin collection check karein
    // ------------------------------------------

    let account = await Admin.findOne({
      email: normalizedEmail,
    }).select("+password");

    // ------------------------------------------
    // Agar admin nahi mila, User collection
    // (customer / vendor) check karein
    // ------------------------------------------

    if (!account) {
      account = await User.findOne({
        email: normalizedEmail,
      });
    }

    if (!account) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      account.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // ------------------------------------------
    // Vendor approval check
    // (Admin model mein vendorStatus exist nahi
    // karta, isliye ye automatically skip ho jata
    // hai admin ke liye)
    // ------------------------------------------

    if (
      account.role === "vendor" &&
      account.vendorStatus !== "approved"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Your vendor account has not been approved by the admin yet.",
      });
    }

    // ------------------------------------------
    // Email verification check
    // ------------------------------------------

    if (!account.isVerified) {
      return res.status(403).json({
        success: false,
        message:
          "Please verify your email before logging in.",
      });
    }

    const token = generateToken(account);

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        id: account._id,
        firstName: account.firstName,
        lastName: account.lastName,
        email: account.email,
        role: account.role,
        vendorStatus: account.vendorStatus,
        isVerified: account.isVerified,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during login.",
      error: error.message,
    });
  }
};

// ======================================================
// VERIFY EMAIL
// ======================================================
//
// FIX (2026): Pehle is function ke end mein
// `verificationToken` aur `verificationTokenExpire`
// ko turant `null` kar diya jata tha. Isse ye bug aata
// tha: agar frontend se verify-email API 2 dafa call
// ho jaye (React StrictMode dev mode mein useEffect
// jaanbojh kar 2 baar chalta hai, ya user double-click
// kar de, ya slow network par retry ho jaye) — to
// pehli call verify kar ke token null kar deti thi,
// aur foran baad aane wali doosri call ko wo token
// DB mein nahi milta tha (kyunke null ho chuka hota),
// is liye "invalid or expired" error aa jata tha —
// HALANKI verification pehli call mein successful ho
// chuki hoti thi.
//
// Fix: token ko turant null nahi kiya ja raha. Isse
// koi security risk nahi hai kyunke token dobara use
// hone se sirf `isVerified = true` set hota hai (jo
// idempotent operation hai — dobara set karne se kuch
// naya nuksan nahi). Token apne aap 24 ghante baad
// expire ho jayega.
// ======================================================

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Verification token is required.",
      });
    }

    // Trim taake email client / browser ki taraf se
    // aayi accidental whitespace ya newline se token
    // corrupt na ho.
    const cleanToken = token.trim();

    // ------------------------------------------
    // Hash token received from URL
    // ------------------------------------------

    const hashedToken = hashToken(cleanToken);

    // ------------------------------------------
    // Find user
    // ------------------------------------------

    const user = await User.findOne({
      verificationToken: hashedToken,
      verificationTokenExpire: {
        $gt: new Date(),
      },
    }).select(
      "+verificationToken +verificationTokenExpire"
    );

    if (!user) {
      return res.status(400).json({
        success: false,
        message:
          "This verification link is invalid or has expired. Please request a new one.",
      });
    }

    // ------------------------------------------
    // Vendor must be approved
    // ------------------------------------------

    if (
      user.role === "vendor" &&
      user.vendorStatus !== "approved"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Your vendor account has not been approved yet.",
      });
    }

    // ------------------------------------------
    // Already verified
    // (Double-call ya link dobara open hone par
    // yahan se hi success response chala jata hai,
    // kyunke token ab null nahi kiya jata.)
    // ------------------------------------------

    if (user.isVerified) {
      return res.status(200).json({
        success: true,
        message: "Email is already verified.",
      });
    }

    // ------------------------------------------
    // Verify
    // ------------------------------------------

    user.isVerified = true;

    // NOTE: Token ko jaanbojh kar null NAHI kiya ja
    // raha — upar comment mein wajah likhi hai.

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Email verified successfully.",
    });
  } catch (error) {
    console.error("Verify email error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while verifying email.",
      error: error.message,
    });
  }
};

// ======================================================
// RESEND VERIFICATION
// ======================================================

export const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified.",
      });
    }

    // Vendor cannot request verification
    // until admin approval
    if (
      user.role === "vendor" &&
      user.vendorStatus !== "approved"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Your vendor account must be approved by the admin first.",
      });
    }

    // ------------------------------------------
    // Generate NEW token
    // ------------------------------------------

    const verificationToken =
      generateVerificationToken();

    const hashedToken =
      hashToken(verificationToken);

    user.verificationToken = hashedToken;

    user.verificationTokenExpire =
      new Date(Date.now() + 24 * 60 * 60 * 1000);

    await user.save();

    // ------------------------------------------
    // Verification URL
    // ------------------------------------------

    const frontendUrl =
      process.env.FRONTEND_URL ||
      "http://localhost:5173";

    const verificationUrl =
      `${frontendUrl}/verify-email/${verificationToken}`;

    // ------------------------------------------
    // Send email
    // ------------------------------------------

    await sendEmail({
      to: user.email,
      subject: "Verify Your Email",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">

          <h2>Verify Your Email</h2>

          <p>Hello ${user.firstName},</p>

          <p>
            Please click the button below to verify your email address.
          </p>

          <div style="margin: 30px 0;">
            <a
              href="${verificationUrl}"
              style="
                display: inline-block;
                padding: 12px 24px;
                background: #171717;
                color: white;
                text-decoration: none;
                border-radius: 6px;
              "
            >
              Verify Email
            </a>
          </div>

          <p>
            This link will expire in 24 hours.
          </p>

        </div>
      `,
    });

    return res.status(200).json({
      success: true,
      message:
        "Verification email sent successfully.",
    });
  } catch (error) {
    console.error(
      "Resend verification error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while resending verification email.",
      error: error.message,
    });
  }
};

// ======================================================
// FORGOT PASSWORD
// ======================================================

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email.",
      });
    }

    const resetToken = crypto
      .randomBytes(32)
      .toString("hex");

    user.resetPasswordToken = hashToken(resetToken);

    user.resetPasswordExpire = new Date(
      Date.now() + 15 * 60 * 1000
    );

    await user.save();

    const frontendUrl =
      process.env.FRONTEND_URL ||
      "http://localhost:5173";

    const resetUrl =
      `${frontendUrl}/reset-password/${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: "Reset Your Password",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">

          <h2>Reset Your Password</h2>

          <p>Hello ${user.firstName},</p>

          <p>
            Click the button below to reset your password.
          </p>

          <div style="margin: 30px 0;">
            <a
              href="${resetUrl}"
              style="
                display: inline-block;
                padding: 12px 24px;
                background: #171717;
                color: white;
                text-decoration: none;
                border-radius: 6px;
              "
            >
              Reset Password
            </a>
          </div>

          <p>
            This link will expire in 15 minutes.
          </p>

        </div>
      `,
    });

    return res.status(200).json({
      success: true,
      message:
        "Password reset email sent successfully.",
    });
  } catch (error) {
    console.error(
      "Forgot password error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while processing forgot password.",
      error: error.message,
    });
  }
};

// ======================================================
// RESET PASSWORD
// ======================================================

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;

    const {
      password,
      confirmPassword,
    } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Reset token is required.",
      });
    }

    if (!password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Password and confirm password are required.",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match.",
      });
    }

    const hashedToken = hashToken(token);

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: {
        $gt: new Date(),
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message:
          "This password reset link is invalid or has expired.",
      });
    }

    user.password = await bcrypt.hash(
      password,
      12
    );

    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;

    await user.save();

    return res.status(200).json({
      success: true,
      message:
        "Password reset successfully. You can now login.",
    });
  } catch (error) {
    console.error(
      "Reset password error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while resetting password.",
      error: error.message,
    });
  }
};
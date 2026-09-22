import crypto from "crypto";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import User from "../models/User.js";
import Admin from "../models/Admin.js";
import sendEmail from "../utils/sendEmail.js";

// ======================================================
// FRONTEND URL
// ======================================================

const getFrontendUrl = () => {
  const url =
    process.env.FRONTEND_URL ||
    process.env.CLIENT_URL ||
    "http://localhost:5173";

  return url.replace(/\/+$/, "");
};

// ======================================================
// GENERATE JWT
// ======================================================

const generateToken = (
  id,
  role
) => {
  return jwt.sign(
    {
      id,
      role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

// ======================================================
// GENERATE VERIFICATION TOKEN
// ======================================================

const generateVerificationToken = () => {
  return crypto
    .randomBytes(32)
    .toString("hex");
};

// ======================================================
// HASH TOKEN
// ======================================================

const hashToken = (
  token
) => {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
};

// ======================================================
// REGISTER
// ======================================================

export const register = async (
  req,
  res
) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      confirmPassword,
      role = "customer",
      address,
      city,
      country,
      storeName,
      storeDescription,
      businessName,
      businessAddress,
    } = req.body;

    // ------------------------------------------
    // REQUIRED FIELDS
    // ------------------------------------------

    if (
      !firstName?.trim() ||
      !email?.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message:
          "First name, email, and password are required.",
      });
    }

    // ------------------------------------------
    // PASSWORD CONFIRMATION
    // ------------------------------------------

    if (
      password !== confirmPassword
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Passwords do not match.",
      });
    }

    // ------------------------------------------
    // VENDOR STORE NAME
    // ------------------------------------------

    if (
      role === "vendor" &&
      !storeName?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Store name is required for vendor accounts.",
      });
    }

    // ------------------------------------------
    // NORMALIZE EMAIL
    // ------------------------------------------

    const normalizedEmail =
      email
        .trim()
        .toLowerCase();

    // ------------------------------------------
    // CHECK EXISTING USER + ADMIN
    // ------------------------------------------

    const [
      existingUser,
      existingAdmin,
    ] = await Promise.all([
      User.findOne({
        email: normalizedEmail,
      }),

      Admin.findOne({
        email: normalizedEmail,
      }),
    ]);

    if (
      existingUser ||
      existingAdmin
    ) {
      return res.status(409).json({
        success: false,
        message:
          "An account with this email already exists.",
      });
    }

    // ------------------------------------------
    // HASH PASSWORD
    // ------------------------------------------

    const hashedPassword =
      await bcrypt.hash(
        password,
        12
      );

    // ------------------------------------------
    // USER DATA
    // ------------------------------------------

    const userData = {
      firstName:
        firstName.trim(),

      lastName:
        lastName?.trim() || "",

      email:
        normalizedEmail,

      password:
        hashedPassword,

      phone:
        phone?.trim() || "",

      profileImage:
        req.file?.path || "",

      role:
        role === "vendor"
          ? "vendor"
          : "customer",

      address:
        address?.trim() || "",

      city:
        city?.trim() || "",

      country:
        country?.trim() || "",
    };

    // ==================================================
    // VENDOR REGISTRATION
    // ==================================================

    if (
      role === "vendor"
    ) {
      userData.vendorStatus =
        "pending";

      userData.storeName =
        storeName.trim();

      userData.storeDescription =
        storeDescription?.trim() || "";

      userData.businessName =
        businessName?.trim() || "";

      userData.businessAddress =
        businessAddress?.trim() || "";

      userData.isVerified =
        false;

      userData.verificationToken =
        undefined;

      userData.verificationTokenExpire =
        undefined;

      const user =
        await User.create(
          userData
        );

      return res.status(201).json({
        success: true,
        pendingApproval: true,
        message:
          "Vendor registration submitted successfully. Please wait for admin approval.",
        user: {
          id: user._id,
          firstName:
            user.firstName,
          lastName:
            user.lastName,
          email:
            user.email,
          role:
            user.role,
          vendorStatus:
            user.vendorStatus,
          isVerified:
            user.isVerified,
        },
      });
    }

    // ==================================================
    // CUSTOMER REGISTRATION
    // ==================================================

    const verificationToken =
      generateVerificationToken();

    const hashedVerificationToken =
      hashToken(
        verificationToken
      );

    userData.isVerified =
      false;

    userData.verificationToken =
      hashedVerificationToken;

    userData.verificationTokenExpire =
      Date.now() +
      24 *
        60 *
        60 *
        1000;

    const user =
      await User.create(
        userData
      );

    // ------------------------------------------
    // CUSTOMER VERIFICATION URL
    // ------------------------------------------

    const verificationUrl =
      `${getFrontendUrl()}/verify-email/${verificationToken}`;

    // ------------------------------------------
    // SEND VERIFICATION EMAIL
    // ------------------------------------------

    try {
      await sendEmail({
        to: user.email,

        subject:
          "Verify your NextTech account",

        html: `
          <div
            style="
              font-family: Arial, sans-serif;
              max-width: 600px;
              margin: auto;
              padding: 30px;
            "
          >

            <h2
              style="color:#171717;"
            >
              Verify your email address
            </h2>

            <p>
              Hello
              ${user.firstName},
            </p>

            <p>
              Thank you for registering with NextTech.
            </p>

            <p>
              Please click the button below
              to verify your email address.
            </p>

            <p>
              <a
                href="${verificationUrl}"
                style="
                  display:inline-block;
                  padding:12px 20px;
                  background:#171717;
                  color:#fff;
                  text-decoration:none;
                  border-radius:6px;
                "
              >
                Verify Email
              </a>
            </p>

            <p>
              This verification link will expire
              in 24 hours.
            </p>

          </div>
        `,
      });
    } catch (
      emailError
    ) {
      console.error(
        "Customer verification email failed:",
        emailError
      );

      await User.findByIdAndDelete(
        user._id
      );

      return res.status(500).json({
        success: false,
        message:
          "Registration could not be completed because the verification email could not be sent.",
      });
    }

    // ------------------------------------------
    // RESPONSE
    // ------------------------------------------

    return res.status(201).json({
      success: true,
      registered: true,
      message:
        "Registration successful. Please check your email to verify your account.",

      user: {
        id: user._id,
        firstName:
          user.firstName,
        lastName:
          user.lastName,
        email:
          user.email,
        role:
          user.role,
        isVerified:
          user.isVerified,
      },
    });
  } catch (error) {
    console.error(
      "Register error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Registration failed. Please try again.",
    });
  }
};

// ======================================================
// LOGIN
// ======================================================

export const login = async (
  req,
  res
) => {
  try {
    const {
      email,
      password,
    } = req.body;

    if (
      !email?.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required.",
      });
    }

    const normalizedEmail =
      email
        .trim()
        .toLowerCase();

    // ==================================================
    // ADMIN LOGIN
    // ==================================================

    const admin =
      await Admin.findOne({
        email:
          normalizedEmail,
      }).select(
        "+password"
      );

    if (admin) {
      const passwordMatch =
        await bcrypt.compare(
          password,
          admin.password
        );

      if (!passwordMatch) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid email or password.",
        });
      }

      const token =
        generateToken(
          admin._id,
          "admin"
        );

      return res.status(200).json({
        success: true,
        token,

        user: {
          id: admin._id,
          firstName:
            admin.firstName,
          lastName:
            admin.lastName,
          email:
            admin.email,
          role:
            "admin",
          isVerified:
            true,
        },
      });
    }

    // ==================================================
    // CUSTOMER / VENDOR LOGIN
    // ==================================================

    const user =
      await User.findOne({
        email:
          normalizedEmail,
      }).select(
        "+password +failedLoginAttempts +lockUntil"
      );

    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password.",
      });
    }

    // ------------------------------------------
    // ACCOUNT LOCK CHECK
    // ------------------------------------------

    if (
      user.lockUntil &&
      user.lockUntil > Date.now()
    ) {
      return res.status(423).json({
        success: false,
        message:
          "Account temporarily locked. Please try again later.",
      });
    }

    // ------------------------------------------
    // PASSWORD CHECK
    // ------------------------------------------

    const passwordMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!passwordMatch) {
      user.failedLoginAttempts =
        (user.failedLoginAttempts ||
          0) +
        1;

      if (
        user.failedLoginAttempts >=
        5
      ) {
        user.lockUntil =
          Date.now() +
          15 *
            60 *
            1000;

        user.failedLoginAttempts =
          0;
      }

      await user.save();

      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password.",
      });
    }

    // ------------------------------------------
    // RESET LOGIN FAILURES
    // ------------------------------------------

    user.failedLoginAttempts =
      0;

    user.lockUntil =
      null;

    // ==================================================
    // VENDOR APPROVAL
    // ==================================================

    if (
      user.role === "vendor"
    ) {
      if (
        user.vendorStatus !==
        "approved"
      ) {
        await user.save();

        return res.status(403).json({
          success: false,
          pendingApproval: true,
          notVerified: false,

          message:
            user.vendorStatus ===
            "rejected"
              ? "Your vendor application has been rejected."
              : "Your vendor application is still waiting for admin approval.",
        });
      }
    }

    // ==================================================
    // EMAIL VERIFICATION
    // ==================================================

    if (
      !user.isVerified
    ) {
      await user.save();

      return res.status(403).json({
        success: false,
        pendingApproval: false,
        notVerified: true,

        message:
          "Please verify your email address before logging in.",
      });
    }

    // ------------------------------------------
    // SAVE
    // ------------------------------------------

    await user.save();

    // ------------------------------------------
    // TOKEN
    // ------------------------------------------

    const token =
      generateToken(
        user._id,
        user.role
      );

    // ------------------------------------------
    // RESPONSE
    // ------------------------------------------

    return res.status(200).json({
      success: true,
      token,

      user: {
        id: user._id,
        firstName:
          user.firstName,
        lastName:
          user.lastName,
        email:
          user.email,
        role:
          user.role,
        isVerified:
          user.isVerified,
        vendorStatus:
          user.vendorStatus,
        profileImage:
          user.profileImage,
        storeName:
          user.storeName,
      },
    });
  } catch (error) {
    console.error(
      "Login error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Login failed. Please try again.",
    });
  }
};

// ======================================================
// VERIFY EMAIL
// ======================================================

export const verifyEmail =
  async (
    req,
    res
  ) => {
    try {
      const {
        token,
      } = req.params;

      if (!token) {
        return res.status(400).json({
          success: false,
          message:
            "Verification token is required.",
        });
      }

      const cleanToken =
        token.trim();

      const hashedToken =
        hashToken(
          cleanToken
        );

      const user =
        await User.findOne({
          verificationToken:
            hashedToken,

          verificationTokenExpire:
            {
              $gt: Date.now(),
            },
        }).select(
          "+verificationToken +verificationTokenExpire"
        );

      if (!user) {
        return res.status(400).json({
          success: false,
          message:
            "This verification link is invalid or has expired.",
        });
      }

      // ------------------------------------------
      // VENDOR APPROVAL CHECK
      // ------------------------------------------

      if (
        user.role ===
          "vendor" &&
        user.vendorStatus !==
          "approved"
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Your vendor account must be approved by an admin before you can verify your email.",
        });
      }

      // ------------------------------------------
      // VERIFY
      // ------------------------------------------

      user.isVerified =
        true;

      user.verificationToken =
        undefined;

      user.verificationTokenExpire =
        undefined;

      await user.save();

      return res.status(200).json({
        success: true,
        message:
          "Email verified successfully. You can now log in.",
      });
    } catch (error) {
      console.error(
        "Verify email error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Email verification failed.",
      });
    }
  };

// ======================================================
// RESEND VERIFICATION
// ======================================================

export const resendVerification =
  async (
    req,
    res
  ) => {
    try {
      const {
        email,
      } = req.body;

      if (
        !email?.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Email is required.",
        });
      }

      const normalizedEmail =
        email
          .trim()
          .toLowerCase();

      const user =
        await User.findOne({
          email:
            normalizedEmail,
        }).select(
          "+verificationToken +verificationTokenExpire"
        );

      if (!user) {
        return res.status(200).json({
          success: true,
          message:
            "If an account with this email exists, a verification email has been sent.",
        });
      }

      if (
        user.isVerified
      ) {
        return res.status(400).json({
          success: false,
          message:
            "This email is already verified.",
        });
      }

      // ------------------------------------------
      // VENDOR APPROVAL
      // ------------------------------------------

      if (
        user.role ===
          "vendor" &&
        user.vendorStatus !==
          "approved"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Your vendor application must be approved by an admin before verification email can be sent.",
        });
      }

      // ------------------------------------------
      // NEW TOKEN
      // ------------------------------------------

      const verificationToken =
        generateVerificationToken();

      user.verificationToken =
        hashToken(
          verificationToken
        );

      user.verificationTokenExpire =
        Date.now() +
        24 *
          60 *
          60 *
          1000;

      await user.save();

      // ------------------------------------------
      // URL
      // ------------------------------------------

      const verificationUrl =
        `${getFrontendUrl()}/verify-email/${verificationToken}`;

      // ------------------------------------------
      // EMAIL
      // ------------------------------------------

      await sendEmail({
        to: user.email,

        subject:
          "Verify your NextTech account",

        html: `
          <div
            style="
              font-family: Arial, sans-serif;
              max-width: 600px;
              margin: auto;
              padding: 30px;
            "
          >

            <h2>
              Verify your email address
            </h2>

            <p>
              Hello
              ${user.firstName},
            </p>

            <p>
              Please click the button below
              to verify your email:
            </p>

            <p>
              <a
                href="${verificationUrl}"
                style="
                  display:inline-block;
                  padding:12px 20px;
                  background:#171717;
                  color:#fff;
                  text-decoration:none;
                  border-radius:6px;
                "
              >
                Verify Email
              </a>
            </p>

            <p>
              This link will expire in
              24 hours.
            </p>

          </div>
        `,
      });

      return res.status(200).json({
        success: true,
        message:
          "A new verification email has been sent.",
      });
    } catch (error) {
      console.error(
        "Resend verification error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Could not resend verification email.",
      });
    }
  };

// ======================================================
// FORGOT PASSWORD
// ======================================================

export const forgotPassword =
  async (
    req,
    res
  ) => {
    try {
      const {
        email,
      } = req.body;

      if (
        !email?.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Email is required.",
        });
      }

      const normalizedEmail =
        email
          .trim()
          .toLowerCase();

      const user =
        await User.findOne({
          email:
            normalizedEmail,
        }).select(
          "+resetPasswordToken +resetPasswordExpire"
        );

      if (!user) {
        return res.status(200).json({
          success: true,
          message:
            "If an account exists for this email, a password reset link has been sent.",
        });
      }

      // ------------------------------------------
      // RESET TOKEN
      // ------------------------------------------

      const resetToken =
        generateVerificationToken();

      user.resetPasswordToken =
        hashToken(
          resetToken
        );

      user.resetPasswordExpire =
        Date.now() +
        15 *
          60 *
          1000;

      await user.save();

      // ------------------------------------------
      // RESET URL
      // ------------------------------------------

      const resetUrl =
        `${getFrontendUrl()}/reset-password/${resetToken}`;

      // ------------------------------------------
      // SEND EMAIL
      // ------------------------------------------

      await sendEmail({
        to: user.email,

        subject:
          "Reset your NextTech password",

        html: `
          <div
            style="
              font-family: Arial, sans-serif;
              max-width: 600px;
              margin: auto;
              padding: 30px;
            "
          >

            <h2>
              Reset your password
            </h2>

            <p>
              Hello
              ${user.firstName},
            </p>

            <p>
              We received a request
              to reset your password.
            </p>

            <p>
              <a
                href="${resetUrl}"
                style="
                  display:inline-block;
                  padding:12px 20px;
                  background:#171717;
                  color:#fff;
                  text-decoration:none;
                  border-radius:6px;
                "
              >
                Reset Password
              </a>
            </p>

            <p>
              This link will expire in
              15 minutes.
            </p>

            <p>
              If you did not request this,
              you can safely ignore this email.
            </p>

          </div>
        `,
      });

      return res.status(200).json({
        success: true,
        message:
          "If an account exists for this email, a password reset link has been sent.",
      });
    } catch (error) {
      console.error(
        "Forgot password error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Could not process password reset request.",
      });
    }
  };

// ======================================================
// RESET PASSWORD
// ======================================================

export const resetPassword =
  async (
    req,
    res
  ) => {
    try {
      const {
        token,
      } = req.params;

      const {
        password,
        confirmPassword,
      } = req.body;

      if (!token) {
        return res.status(400).json({
          success: false,
          message:
            "Reset token is required.",
        });
      }

      if (
        !password ||
        !confirmPassword
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Password and confirm password are required.",
        });
      }

      if (
        password !==
        confirmPassword
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Passwords do not match.",
        });
      }

      // ------------------------------------------
      // HASH TOKEN
      // ------------------------------------------

      const hashedToken =
        hashToken(token);

      // ------------------------------------------
      // FIND USER
      // ------------------------------------------

      const user =
        await User.findOne({
          resetPasswordToken:
            hashedToken,

          resetPasswordExpire:
            {
              $gt: Date.now(),
            },
        }).select(
          "+resetPasswordToken +resetPasswordExpire +password"
        );

      if (!user) {
        return res.status(400).json({
          success: false,
          message:
            "This password reset link is invalid or has expired.",
        });
      }

      // ------------------------------------------
      // NEW PASSWORD
      // ------------------------------------------

      user.password =
        await bcrypt.hash(
          password,
          12
        );

      user.resetPasswordToken =
        undefined;

      user.resetPasswordExpire =
        undefined;

      user.failedLoginAttempts =
        0;

      user.lockUntil =
        null;

      await user.save();

      return res.status(200).json({
        success: true,
        message:
          "Password reset successful. You can now log in.",
      });
    } catch (error) {
      console.error(
        "Reset password error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Could not reset password.",
      });
    }
  };
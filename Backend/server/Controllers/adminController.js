import mongoose from "mongoose";
import crypto from "crypto";

import Customer from "../models/Customer.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import sendEmail from "../utils/sendEmail.js";

// ======================================================
// FORMAT VENDOR FOR ADMIN RESPONSE
// ======================================================

const formatVendorForAdmin = (vendor) => ({
  id: vendor._id,
  firstName: vendor.firstName,
  lastName: vendor.lastName,
  email: vendor.email,
  phone: vendor.phone,
  storeName: vendor.storeName,
  storeDescription: vendor.storeDescription,
  businessName: vendor.businessName,
  businessAddress: vendor.businessAddress,
  vendorStatus: vendor.vendorStatus,
  isVerified: vendor.isVerified,
  createdAt: vendor.createdAt,
});

// ======================================================
// GET DASHBOARD STATS
// GET /api/admin/dashboard-stats
// ======================================================

export const getDashboardStats = async (req, res) => {
  try {
    const [
      totalCustomers,
      totalVendors,
      pendingVendors,
      approvedVendors,
      rejectedVendors,
      totalProducts,
    ] = await Promise.all([
      // Customers are still counted from Customer model
      Customer.countDocuments(),

      // Vendors are stored in User collection
      User.countDocuments({
        role: "vendor",
      }),

      User.countDocuments({
        role: "vendor",
        vendorStatus: "pending",
      }),

      User.countDocuments({
        role: "vendor",
        vendorStatus: "approved",
      }),

      User.countDocuments({
        role: "vendor",
        vendorStatus: "rejected",
      }),

      Product.countDocuments(),
    ]);

    return res.status(200).json({
      success: true,

      stats: {
        totalCustomers,
        totalVendors,
        pendingVendors,
        approvedVendors,
        rejectedVendors,
        totalProducts,
      },
    });
  } catch (error) {
    console.error(
      "ADMIN DASHBOARD STATS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load dashboard stats.",
    });
  }
};

// ======================================================
// GET VENDORS
// GET /api/admin/vendors
// ======================================================

export const getVendors = async (req, res) => {
  try {
    const status = String(
      req.query.status || ""
    ).trim();

    const query = {};

    if (
      ["pending", "approved", "rejected"].includes(
        status
      )
    ) {
      query.vendorStatus = status;
    }

    // Vendors are stored inside User collection
    const vendors = await User.find({
      role: "vendor",
      ...query,
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      totalVendors: vendors.length,

      vendors: vendors.map(
        formatVendorForAdmin
      ),
    });
  } catch (error) {
    console.error(
      "ADMIN GET VENDORS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch vendors.",
    });
  }
};

// ======================================================
// APPROVE VENDOR
// PATCH /api/admin/vendors/:id/approve
// ======================================================

export const approveVendor = async (req, res) => {
  try {
    const { id } = req.params;

    // ==========================================
    // CHECK VENDOR ID
    // ==========================================

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid vendor ID.",
      });
    }

    // ==========================================
    // FIND VENDOR
    // ==========================================

    // Vendor registration uses User model,
    // so admin approval must also use User.
    const vendor = await User.findOne({
      _id: id,
      role: "vendor",
    }).select(
      "+verificationToken +verificationTokenExpire"
    );

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found.",
      });
    }

    // ==========================================
    // APPROVE VENDOR
    // ==========================================

    vendor.vendorStatus = "approved";

    let verificationToken = null;

    // ==========================================
    // GENERATE VERIFICATION TOKEN
    // ==========================================

    if (!vendor.isVerified) {
      // Generate RAW token
      verificationToken =
        crypto.randomBytes(32).toString("hex");

      // Store HASHED token in database
      vendor.verificationToken = crypto
        .createHash("sha256")
        .update(verificationToken)
        .digest("hex");

      // Token expires after 24 hours
      vendor.verificationTokenExpire =
        new Date(
          Date.now() + 24 * 60 * 60 * 1000
        );
    }

    await vendor.save();

    // ==========================================
    // SEND EMAIL
    // ==========================================

    let emailSent = true;

    try {
      // ========================================
      // UNVERIFIED VENDOR
      // SEND VERIFICATION EMAIL
      // ========================================

      if (!vendor.isVerified) {
        const clientUrl =
          process.env.FRONTEND_URL ||
          process.env.CLIENT_URL ||
          "http://localhost:5173";

        const verificationUrl =
          `${clientUrl}/verify-email/${verificationToken}`;

        await sendEmail({
          to: vendor.email,

          subject:
            "Your NextTech Vendor Account Has Been Approved",

          html: `
            <!DOCTYPE html>

            <html>
              <head>
                <meta charset="UTF-8" />
                <title>Vendor Approval</title>
              </head>

              <body
                style="
                  margin: 0;
                  padding: 0;
                  background: #f5f5f5;
                  font-family: Arial, sans-serif;
                "
              >

                <div
                  style="
                    max-width: 600px;
                    margin: 40px auto;
                    background: #ffffff;
                    padding: 35px;
                    border-radius: 10px;
                  "
                >

                  <h2
                    style="
                      color: #171717;
                      margin-bottom: 20px;
                    "
                  >
                    Vendor Account Approved
                  </h2>

                  <p>
                    Hello
                    <strong>${vendor.firstName}</strong>,
                  </p>

                  <p>
                    Your NextTech vendor application
                    has been approved by the administrator.
                  </p>

                  <p>
                    Your store:
                    <strong>${vendor.storeName}</strong>
                  </p>

                  <p>
                    Please verify your email address
                    before logging into your vendor account.
                  </p>

                  <div
                    style="
                      text-align: center;
                      margin: 30px 0;
                    "
                  >

                    <a
                      href="${verificationUrl}"
                      style="
                        display: inline-block;
                        padding: 13px 25px;
                        background: #171717;
                        color: #ffffff;
                        text-decoration: none;
                        border-radius: 6px;
                        font-weight: bold;
                      "
                    >
                      Verify Email
                    </a>

                  </div>

                  <p>
                    This verification link will expire
                    in 24 hours.
                  </p>

                  <p
                    style="
                      color: #777;
                      font-size: 13px;
                    "
                  >
                    If you did not request this account,
                    you can ignore this email.
                  </p>

                </div>

              </body>
            </html>
          `,
        });
      }

      // ========================================
      // ALREADY VERIFIED VENDOR
      // SEND NORMAL APPROVAL EMAIL
      // ========================================

      else {
        await sendEmail({
          to: vendor.email,

          subject:
            "Your NextTech Vendor Account Has Been Approved",

          html: `
            <!DOCTYPE html>

            <html>
              <body
                style="
                  font-family: Arial, sans-serif;
                  max-width: 600px;
                  margin: 40px auto;
                  padding: 30px;
                "
              >

                <h2>
                  Vendor Account Approved
                </h2>

                <p>
                  Hi
                  <strong>${vendor.firstName}</strong>,
                </p>

                <p>
                  Your vendor account has been approved.
                </p>

                <p>
                  Store:
                  <strong>${vendor.storeName}</strong>
                </p>

                <p>
                  You can now log in and start
                  managing your store.
                </p>

              </body>
            </html>
          `,
        });
      }

      console.log(
        `Approval email sent to ${vendor.email}`
      );
    } catch (emailError) {
      emailSent = false;

      console.error(
        "================================="
      );

      console.error(
        "VENDOR APPROVAL EMAIL ERROR"
      );

      console.error(
        "Message:",
        emailError.message
      );

      console.error(
        "Code:",
        emailError.code
      );

      console.error(
        "Response:",
        emailError.response
      );

      console.error(
        "================================="
      );
    }

    // ==========================================
    // RESPONSE
    // ==========================================

    return res.status(200).json({
      success: true,

      emailSent,

      message: emailSent
        ? vendor.isVerified
          ? "Vendor approved successfully."
          : "Vendor approved. A verification email has been sent to the vendor."
        : "Vendor approved, but the email could not be sent. The vendor can request a new verification email from the login page.",

      vendor: formatVendorForAdmin(vendor),
    });
  } catch (error) {
    console.error(
      "APPROVE VENDOR ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to approve vendor.",
    });
  }
};

// ======================================================
// REJECT VENDOR
// PATCH /api/admin/vendors/:id/reject
// ======================================================

export const rejectVendor = async (req, res) => {
  try {
    const { id } = req.params;

    const { reason } = req.body;

    // ==========================================
    // CHECK ID
    // ==========================================

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid vendor ID.",
      });
    }

    // ==========================================
    // FIND VENDOR
    // ==========================================

    // Vendor is stored in User collection
    const vendor = await User.findOne({
      _id: id,
      role: "vendor",
    });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found.",
      });
    }

    // ==========================================
    // REJECT
    // ==========================================

    vendor.vendorStatus = "rejected";

    await vendor.save();

    // ==========================================
    // SEND REJECTION EMAIL
    // ==========================================

    try {
      await sendEmail({
        to: vendor.email,

        subject:
          "Update on Your NextTech Vendor Application",

        html: `
          <div
            style="
              font-family: Arial, sans-serif;
              max-width: 480px;
              margin: 0 auto;
            "
          >

            <h2>
              Vendor Application Update
            </h2>

            <p>
              Hi
              <strong>${vendor.firstName}</strong>,
            </p>

            <p>
              Unfortunately, your store
              "<strong>${vendor.storeName}</strong>"
              application was not approved at this time.
            </p>

            ${
              typeof reason === "string" &&
              reason.trim()
                ? `
                  <p>
                    <strong>Reason:</strong>
                    ${reason.trim().slice(0, 300)}
                  </p>
                `
                : ""
            }

            <p>
              You may contact support if you would
              like to reapply.
            </p>

          </div>
        `,
      });
    } catch (emailError) {
      console.error(
        "VENDOR REJECTION EMAIL ERROR:",
        emailError.message
      );
    }

    return res.status(200).json({
      success: true,
      message: "Vendor rejected.",
      vendor: formatVendorForAdmin(vendor),
    });
  } catch (error) {
    console.error(
      "REJECT VENDOR ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to reject vendor.",
    });
  }
};
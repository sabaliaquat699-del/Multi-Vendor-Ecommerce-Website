import mongoose from "mongoose";
import Customer from "../models/Customer.js";
import Vendor from "../models/Vendor.js";
import Product from "../models/Product.js";
import sendEmail from "../utils/sendEmail.js";

// ======================================================
// Format a vendor for admin-facing responses — never
// leaks password/token fields.
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
      Customer.countDocuments(),
      Vendor.countDocuments(),
      Vendor.countDocuments({ vendorStatus: "pending" }),
      Vendor.countDocuments({ vendorStatus: "approved" }),
      Vendor.countDocuments({ vendorStatus: "rejected" }),
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
    console.error("ADMIN DASHBOARD STATS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load dashboard stats.",
    });
  }
};

// ======================================================
// GET VENDORS
// GET /api/admin/vendors?status=pending|approved|rejected
// (status omitted or invalid -> returns all vendors)
// ======================================================
export const getVendors = async (req, res) => {
  try {
    const status = String(req.query.status || "").trim();
    const query = {};

    if (["pending", "approved", "rejected"].includes(status)) {
      query.vendorStatus = status;
    }

    const vendors = await Vendor.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      totalVendors: vendors.length,
      vendors: vendors.map(formatVendorForAdmin),
    });
  } catch (error) {
    console.error("ADMIN GET VENDORS ERROR:", error);
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

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid vendor ID.",
      });
    }

    const vendor = await Vendor.findById(id);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found.",
      });
    }

    vendor.vendorStatus = "approved";
    await vendor.save();

    // Best-effort notification email — approval still
    // succeeds even if the email fails to send.
    try {
      await sendEmail({
        to: vendor.email,
        subject: "Your NextTech vendor account has been approved",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
            <h2>You're approved!</h2>
            <p>Hi ${vendor.firstName}, your store "<strong>${vendor.storeName}</strong>"
            has been approved. You can now log in and start listing products.</p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("VENDOR APPROVAL EMAIL ERROR:", emailError);
    }

    return res.status(200).json({
      success: true,
      message: "Vendor approved successfully.",
      vendor: formatVendorForAdmin(vendor),
    });
  } catch (error) {
    console.error("APPROVE VENDOR ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to approve vendor.",
    });
  }
};

// ======================================================
// REJECT VENDOR
// PATCH /api/admin/vendors/:id/reject
// Body (optional): { reason: "..." }
// ======================================================
export const rejectVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid vendor ID.",
      });
    }

    const vendor = await Vendor.findById(id);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found.",
      });
    }

    vendor.vendorStatus = "rejected";
    await vendor.save();

    try {
      await sendEmail({
        to: vendor.email,
        subject: "Update on your NextTech vendor application",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
            <h2>Vendor application update</h2>
            <p>Hi ${vendor.firstName}, unfortunately your store "<strong>${vendor.storeName}</strong>"
            application was not approved at this time.</p>
            ${
              typeof reason === "string" && reason.trim()
                ? `<p><strong>Reason:</strong> ${reason.trim().slice(0, 300)}</p>`
                : ""
            }
            <p>You may contact support if you'd like to reapply.</p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("VENDOR REJECTION EMAIL ERROR:", emailError);
    }

    return res.status(200).json({
      success: true,
      message: "Vendor rejected.",
      vendor: formatVendorForAdmin(vendor),
    });
  } catch (error) {
    console.error("REJECT VENDOR ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to reject vendor.",
    });
  }
};
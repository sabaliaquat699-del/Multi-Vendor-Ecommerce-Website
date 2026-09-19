import express from "express";
import {
  getDashboardStats,
  getVendors,
  approveVendor,
  rejectVendor,
} from "../Controllers/adminController.js";
import { protect, authorize } from "../Middleware/authMiddleware.js";

const router = express.Router();

// Every route below requires a valid JWT AND role === "admin".
router.use(protect, authorize("admin"));

router.get("/dashboard-stats", getDashboardStats);
router.get("/vendors", getVendors);
router.patch("/vendors/:id/approve", approveVendor);
router.patch("/vendors/:id/reject", rejectVendor);

export default router;
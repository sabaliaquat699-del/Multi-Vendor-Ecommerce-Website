import express from "express";
import { getAllDeals, createDeal } from "../Controllers/dealController.js";

const router = express.Router();

router.get("/", getAllDeals);
router.post("/", createDeal);

export default router;
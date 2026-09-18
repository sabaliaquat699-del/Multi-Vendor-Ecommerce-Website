import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "../config/db.js";
import Product from "../models/Product.js";
import reviewRoutes from "../routes/reviewRoutes.js";
import authRoutes from "../routes/authRoutes.js";
import dealRoutes from "../routes/dealRoutes.js";

// ======================================================
// ENVIRONMENT VARIABLES
// ======================================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// .env file ab ek folder upar hai (server/.env), isliye ../
dotenv.config({
  path: path.join(__dirname, "..", ".env"),
});

const app = express();

// ======================================================
// SECURITY
// ======================================================

app.use(helmet());

// ======================================================
// CORS
// ======================================================

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn("Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// ======================================================
// JSON
// ======================================================

app.use(express.json());

// ======================================================
// UPLOADS
// ======================================================
// NOTE: Vercel serverless mein filesystem temporary hota hai,
// naye uploads yahan persist NAHI honge. Cloudinary/S3 use karein.

app.use(
  "/uploads",
  express.static(path.join(__dirname, "..", "uploads"))
);

// ======================================================
// DATABASE
// ======================================================

// ======================================================
// DATABASE — wait for connection before handling requests
// ======================================================

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("Database connection failed:", error.message);
    res.status(503).json({
      success: false,
      message: "Database connection failed. Please try again shortly.",
    });
  }
});
// ======================================================
// AUTH ROUTES
// ======================================================

app.use("/api/auth", authRoutes);



app.use("/api/reviews", reviewRoutes);



app.use("/api/deals", dealRoutes);

app.get("/api/products", async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 16, 1), 100);
    const search = String(req.query.search || "").trim();
    const category = String(req.query.category || "").trim();
    const sort = String(req.query.sort || "").trim();

    const query = {};

    if (search) {
      const searchRegex = { $regex: search, $options: "i" };
      query.$or = [
        { name: searchRegex },
        { category: searchRegex },
        { sub_category: searchRegex },
        { subCategory: searchRegex },
        { vendor: searchRegex },
      ];
    }

    if (category && category.toLowerCase() !== "all") {
      query.category = { $regex: `^${category}$`, $options: "i" };
    }

    let sortOption = { _id: -1 };
    if (sort === "price-low") sortOption = { price: 1 };
    else if (sort === "price-high") sortOption = { price: -1 };
    else if (sort === "rating") sortOption = { rating: -1 };

    const totalProducts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / limit);

    const products = await Product.find(query)
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      success: true,
      currentPage: page,
      productsPerPage: limit,
      totalProducts,
      totalPages,
      search,
      category,
      sort,
      products,
    });
  } catch (error) {
    console.error("GET PRODUCTS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
});

app.get("/api/products/:id", async (req, res) => {
  try {
    const productId = Number(req.params.id);

    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findOne({ id: productId });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("SINGLE PRODUCT ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
    });
  }
});


app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Electronic Marketplace API is running",
  });
});

export default app;
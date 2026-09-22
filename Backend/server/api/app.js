import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "../config/db.js";
import Product from "../models/Product.js";

import reviewRoutes from "../routes/reviewRoutes.js";
import authRoutes from "../routes/authRoutes.js";
import adminRoutes from "../routes/adminRoutes.js";
import dealRoutes from "../routes/dealRoutes.js";

import {
  mongoSanitize,
  preventHpp,
  xssClean,
} from "../Middleware/securityMiddleware.js";

// ======================================================
// ENVIRONMENT VARIABLES
// ======================================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.join(__dirname, "..", ".env"),
});

const app = express();

// ======================================================
// SECURITY
// ======================================================

app.use(helmet());
app.use(compression());

// ======================================================
// CORS
// ======================================================

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
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
// JSON + BODY SIZE LIMIT
// ======================================================

app.use(express.json({ limit: "10kb" }));

// ======================================================
// NOSQL INJECTION / HPP / XSS GUARDS
// ======================================================

app.use(mongoSanitize);
app.use(preventHpp);
app.use(xssClean);

// ======================================================
// UPLOADS
// ======================================================

// NOTE:
// Vercel serverless filesystem permanent nahi hota.
// Production mein Cloudinary / S3 jaisi storage use karna
// better hai.

app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "..", "uploads")
  )
);

// ======================================================
// DATABASE
// ======================================================

// Har request ke liye DB connection ensure karega.

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error(
      "Database connection failed:",
      error.message
    );

    return res.status(503).json({
      success: false,
      message:
        "Database connection failed. Please try again shortly.",
    });
  }
});

// ======================================================
// AUTH ROUTES
// ======================================================

app.use(
  "/api/auth",
  authRoutes
);

// ======================================================
// ADMIN ROUTES
// ======================================================

app.use(
  "/api/admin",
  adminRoutes
);

// ======================================================
// REVIEW ROUTES
// ======================================================

app.use(
  "/api/reviews",
  reviewRoutes
);

// ======================================================
// DEAL ROUTES
// ======================================================

app.use(
  "/api/deals",
  dealRoutes
);

// ======================================================
// GET ALL PRODUCTS
// GET /api/products
// ======================================================

app.get(
  "/api/products",
  async (req, res) => {
    try {
      const page = Math.max(
        Number(req.query.page) || 1,
        1
      );

      const limit = Math.min(
        Math.max(
          Number(req.query.limit) || 16,
          1
        ),
        100
      );

      const search = String(
        req.query.search || ""
      ).trim();

      const category = String(
        req.query.category || ""
      ).trim();

      const sort = String(
        req.query.sort || ""
      ).trim();

      const query = {};

      // ------------------------------------------
      // SEARCH
      // ------------------------------------------

      if (search) {
        const searchRegex = {
          $regex: search,
          $options: "i",
        };

        query.$or = [
          {
            name: searchRegex,
          },
          {
            category: searchRegex,
          },
          {
            sub_category: searchRegex,
          },
          {
            subCategory: searchRegex,
          },
          {
            vendor: searchRegex,
          },
        ];
      }

      // ------------------------------------------
      // CATEGORY
      // ------------------------------------------

      if (
        category &&
        category.toLowerCase() !== "all"
      ) {
        query.category = {
          $regex: `^${category}$`,
          $options: "i",
        };
      }

      // ------------------------------------------
      // SORT
      // ------------------------------------------

      let sortOption = {
        _id: -1,
      };

      if (sort === "price-low") {
        sortOption = {
          price: 1,
        };
      } else if (sort === "price-high") {
        sortOption = {
          price: -1,
        };
      } else if (sort === "rating") {
        sortOption = {
          rating: -1,
        };
      }

      // ------------------------------------------
      // COUNT
      // ------------------------------------------

      const totalProducts =
        await Product.countDocuments(query);

      const totalPages = Math.ceil(
        totalProducts / limit
      );

      // ------------------------------------------
      // PRODUCTS
      // ------------------------------------------

      const products =
        await Product.find(query)
          .sort(sortOption)
          .skip(
            (page - 1) * limit
          )
          .limit(limit);

      return res.status(200).json({
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
      console.error(
        "GET PRODUCTS ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch products",
      });
    }
  }
);

// ======================================================
// GET SINGLE PRODUCT
// GET /api/products/:id
// ======================================================

app.get(
  "/api/products/:id",
  async (req, res) => {
    try {
      const productId =
        Number(req.params.id);

      if (
        !Number.isInteger(productId) ||
        productId <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid product ID",
        });
      }

      const product =
        await Product.findOne({
          id: productId,
        });

      if (!product) {
        return res.status(404).json({
          success: false,
          message:
            "Product not found",
        });
      }

      return res.status(200).json({
        success: true,
        product,
      });
    } catch (error) {
      console.error(
        "SINGLE PRODUCT ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch product",
      });
    }
  }
);

// ======================================================
// ROOT
// ======================================================

app.get(
  "/",
  (req, res) => {
    return res.status(200).json({
      success: true,
      message:
        "Electronic Marketplace API is running",
    });
  }
);

// ======================================================
// EXPORT
// ======================================================

export default app;
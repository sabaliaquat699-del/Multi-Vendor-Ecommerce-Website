import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./config/db.js";
import Product from "./models/Product.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import authRoutes from "./routes/authRoutes.js";

// Load environment variables
dotenv.config({
  path: "./Backend/server/.env",
});

// Needed because this project uses ES modules, where
// __dirname is not available by default like in CommonJS.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ======================================================
// SECURITY MIDDLEWARE
// ======================================================

// Helmet sets a range of protective HTTP headers
// (X-Content-Type-Options, X-Frame-Options, etc.) that
// guard against clickjacking, MIME-sniffing, and other
// common browser-based attacks.
app.use(helmet());

// CORS — restricted to the actual frontend origin instead
// of allowing every website on the internet to call this
// API from a browser. Falls back to localhost during dev
// if CLIENT_URL isn't set.
const allowedOrigin = process.env.CLIENT_URL || "http://localhost:5173";
app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  })
);

app.use(express.json());

// Serve uploaded profile images at
// http://localhost:5000/uploads/profile-images/xxxx.jpg
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Database
connectDB();

// Auth routes
app.use("/api/auth", authRoutes);

// Review routes
app.use("/api/reviews", reviewRoutes);

// GET ALL PRODUCTS
// Search / Category / Sort / Pagination
app.get("/api/products", async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);

    const limit = Math.min(
      Math.max(Number(req.query.limit) || 16, 1),
      100
    );

    const search = String(req.query.search || "").trim();
    const category = String(req.query.category || "").trim();
    const sort = String(req.query.sort || "").trim();

    const query = {};

    // Search
    if (search) {
      const searchRegex = {
        $regex: search,
        $options: "i",
      };

      query.$or = [
        { name: searchRegex },
        { category: searchRegex },
        { sub_category: searchRegex },
        { subCategory: searchRegex },
        { vendor: searchRegex },
      ];
    }

    // Category
    if (category && category.toLowerCase() !== "all") {
      query.category = {
        $regex: `^${category}$`,
        $options: "i",
      };
    }

    // Sort
    let sortOption = { _id: -1 };

    if (sort === "price-low") {
      sortOption = { price: 1 };
    } else if (sort === "price-high") {
      sortOption = { price: -1 };
    } else if (sort === "rating") {
      sortOption = { rating: -1 };
    }

    // Total products
    const totalProducts = await Product.countDocuments(query);

    const totalPages = Math.ceil(totalProducts / limit);

    // Products
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

// GET SINGLE PRODUCT
app.get("/api/products/:id", async (req, res) => {
  try {
    const productId = Number(req.params.id);

    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findOne({
      id: productId,
    });

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

// ======================================================
// DEALS
// ======================================================
// NOTE: Deals live in memory for now (no Deal model yet).
// Each deal only stores a reference (productId) — the
// actual product data always comes fresh from MongoDB via
// the Product model, so prices/stock/etc. stay in sync.

let deals = [
  {
    id: 1,
    productId: 1,
    saleName: "Mega Sale",
    discountPercent: 50,
    startDate: "2026-09-10T00:00:00",
    endDate: "2026-09-20T23:59:59",
  },
  {
    id: 2,
    productId: 2,
    saleName: "Flash Offer",
    discountPercent: 50,
    startDate: "2026-09-10T00:00:00",
    endDate: "2026-09-18T23:59:59",
  },
  {
    id: 3,
    productId: 3,
    saleName: "Weekend Sale",
    discountPercent: 50,
    startDate: "2026-09-12T00:00:00",
    endDate: "2026-09-15T23:59:59",
  },
  {
    id: 4,
    productId: 4,
    saleName: "Special Offer",
    discountPercent: 50,
    startDate: "2026-09-10T00:00:00",
    endDate: "2026-09-25T23:59:59",
  },
];

const getSaleStatus = (startDate, endDate) => {
  const now = new Date();

  if (now < new Date(startDate)) return "upcoming";
  if (now > new Date(endDate)) return "ended";

  return "active";
};

// GET ALL DEALS (with live sale prices pulled from MongoDB)
app.get("/api/deals", async (req, res) => {
  try {
    const saleProducts = await Promise.all(
      deals.map(async (deal) => {
        const product = await Product.findOne({ id: deal.productId });

        if (!product) return null;

        const productObj = product.toObject();

        const originalPrice = Number(
          productObj.oldPrice || productObj.price
        );

        const salePrice = Number(
          (originalPrice * (1 - deal.discountPercent / 100)).toFixed(2)
        );

        return {
          ...productObj,
          ...deal,
          originalPrice,
          price: salePrice,
          isOnSale: true,
          saleStatus: getSaleStatus(deal.startDate, deal.endDate),
        };
      })
    );

    res.status(200).json(saleProducts.filter(Boolean));
  } catch (error) {
    console.error("GET DEALS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch deals",
    });
  }
});

// CREATE A NEW DEAL
app.post("/api/deals", async (req, res) => {
  try {
    const { productId, saleName, discountPercent, startDate, endDate } =
      req.body;

    if (!productId || !saleName || !discountPercent || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Please provide all deal fields",
      });
    }

    const product = await Product.findOne({ id: Number(productId) });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const newDeal = {
      id: deals.length + 1,
      productId: Number(productId),
      saleName,
      discountPercent: Number(discountPercent),
      startDate,
      endDate,
    };

    deals.push(newDeal);

    res.status(201).json({
      success: true,
      deal: newDeal,
    });
  } catch (error) {
    console.error("CREATE DEAL ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create deal",
    });
  }
});

// Root route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Electronic Marketplace API is running",
  });
});

// Server
const PORT = process.env.SERVER_PORT || process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
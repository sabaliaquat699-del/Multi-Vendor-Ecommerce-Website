import Product from "../models/Product.js";

// ======================================================
// DEALS DATA
// ======================================================

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

// ======================================================
// SALE STATUS HELPER
// ======================================================

const getSaleStatus = (startDate, endDate) => {
  const now = new Date();
  if (now < new Date(startDate)) return "upcoming";
  if (now > new Date(endDate)) return "ended";
  return "active";
};

// ======================================================
// GET ALL DEALS
// ======================================================

export const getAllDeals = async (req, res) => {
  try {
    const saleProducts = await Promise.all(
      deals.map(async (deal) => {
        const product = await Product.findOne({ id: deal.productId });
        if (!product) return null;

        const productObj = product.toObject();
        const originalPrice = Number(productObj.oldPrice || productObj.price);
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
};

// ======================================================
// CREATE A NEW DEAL
// ======================================================

export const createDeal = async (req, res) => {
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
};
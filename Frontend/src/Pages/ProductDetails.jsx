import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import useCartStore from "../store/cartstore";
import { API_URL } from "../config";

function ProductDetails() {
  const { id } = useParams();

  // ======================================================
  // PRODUCT
  // ======================================================

  const [product, setProduct] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ======================================================
  // QUANTITY
  // ======================================================

  const [quantity, setQuantity] = useState(1);

  // ======================================================
  // REVIEWS
  // ======================================================

  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewError, setReviewError] = useState("");

  // ======================================================
  // REVIEW FORM
  // ======================================================

  const [selectedRating, setSelectedRating] = useState(0);
  const [comment, setComment] = useState("");

  const [submittingReview, setSubmittingReview] =
    useState(false);

  // ======================================================
  // CART
  // ======================================================

  const addToCart = useCartStore(
    (state) => state.addToCart
  );

  // ======================================================
  // FETCH PRODUCT
  // ======================================================

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const numericId = Number(id);

        if (
          !Number.isInteger(numericId) ||
          numericId <= 0
        ) {
          throw new Error("Invalid product ID");
        }

        const response = await fetch(
          `${API_URL}/api/products/${numericId}`
        );

        if (!response.ok) {
          throw new Error(
            "Failed to fetch product"
          );
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(
            data.message ||
              "Unable to load product"
          );
        }

        // Support both:
        // { success: true, product: {...} }
        // and direct product response if backend uses it.
        const fetchedProduct =
          data.product || data.data;

        if (!fetchedProduct) {
          throw new Error(
            "Product not found"
          );
        }

        setProduct(fetchedProduct);

        // Reset quantity when product changes
        setQuantity(1);

      } catch (error) {
        console.error(
          "Product Details Error:",
          error
        );

        setError(
          error.message ||
            "Unable to load product. Please check your backend server."
        );

      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // ======================================================
  // FETCH REVIEWS
  // ======================================================

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setReviewsLoading(true);
        setReviewError("");

        const numericId = Number(id);

        if (
          !Number.isInteger(numericId) ||
          numericId <= 0
        ) {
          throw new Error(
            "Invalid product ID"
          );
        }

        const response = await fetch(
          `${API_URL}/api/reviews/product/${numericId}`
        );

        if (!response.ok) {
          throw new Error(
            "Failed to fetch reviews"
          );
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(
            data.message ||
              "Unable to load reviews"
          );
        }

        setReviews(data.reviews || []);

        setAverageRating(
          Number(data.averageRating) || 0
        );

        setTotalReviews(
          Number(data.totalReviews) || 0
        );

      } catch (error) {
        console.error(
          "Reviews Error:",
          error
        );

        setReviewError(
          error.message ||
            "Unable to load reviews."
        );

      } finally {
        setReviewsLoading(false);
      }
    };

    fetchReviews();
  }, [id]);

  // ======================================================
  // IMAGE ERROR
  // ======================================================

   const handleImageError = (event) => {
    event.currentTarget.onerror = null;
    event.currentTarget.src =
      "https://placehold.co/600x500/f3f3f3/171717?text=Product";
  };

  // ======================================================
  // QUANTITY
  // ======================================================

  const increaseQuantity = () => {
    if (!product) return;

    const stock = Number(product.stock) || 0;

    setQuantity((current) =>
      current < stock
        ? current + 1
        : current
    );
  };

  const decreaseQuantity = () => {
    setQuantity((current) =>
      current > 1
        ? current - 1
        : 1
    );
  };

  // ======================================================
  // ADD TO CART
  // ======================================================

  const handleAddToCart = () => {
    if (!product) return;

    const stock = Number(product.stock) || 0;

    if (stock <= 0) {
      alert("This product is out of stock.");
      return;
    }

    // Add product according to the current cart store
    // while preserving the selected quantity.
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }

    alert(
      `${product.name} added to cart!`
    );
  };

  // ======================================================
  // BUY NOW
  // ======================================================

  const handleBuyNow = () => {
    if (!product) return;

    const stock = Number(product.stock) || 0;

    if (stock <= 0) {
      alert("This product is out of stock.");
      return;
    }

    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }

    window.location.href = "/checkout";
  };

  // ======================================================
  // SUBMIT REVIEW
  // ======================================================

  const handleSubmitReview = async (event) => {
    event.preventDefault();

    if (!selectedRating) {
      setReviewError(
        "Please select a rating."
      );
      return;
    }

    if (!comment.trim()) {
      setReviewError(
        "Please write a review comment."
      );
      return;
    }

    try {
      setSubmittingReview(true);
      setReviewError("");

      const numericId = Number(id);

      const response = await fetch(
        `${API_URL}/api/reviews`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            productId: numericId,
            rating: selectedRating,
            comment: comment.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Unable to submit review."
        );
      }

      // --------------------------------------------------
      // ADD NEW REVIEW TO UI
      // --------------------------------------------------

      if (data.review) {
        setReviews((current) => [
          data.review,
          ...current,
        ]);
      }

      // --------------------------------------------------
      // UPDATE RATING
      // --------------------------------------------------

      const newAverage =
        Number(data.averageRating) || 0;

      const newTotal =
        Number(data.totalReviews) ||
        0;

      setAverageRating(newAverage);
      setTotalReviews(newTotal);

      // --------------------------------------------------
      // UPDATE PRODUCT RATING LOCALLY
      // --------------------------------------------------

      setProduct((current) => {
        if (!current) return current;

        return {
          ...current,
          rating: newAverage,
          reviews: newTotal,
        };
      });

      // --------------------------------------------------
      // RESET FORM
      // --------------------------------------------------

      setSelectedRating(0);
      setComment("");

      alert(
        "Review added successfully!"
      );

    } catch (error) {
      console.error(
        "Submit Review Error:",
        error
      );

      setReviewError(
        error.message ||
          "Unable to submit review."
      );

    } finally {
      setSubmittingReview(false);
    }
  };

  // ======================================================
  // DELETE REVIEW
  // ======================================================

  const handleDeleteReview = async (
    reviewId
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this review?"
    );

    if (!confirmed) return;

    try {
      setReviewError("");

      const response = await fetch(
        `${API_URL}/api/reviews/${reviewId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Unable to delete review."
        );
      }

      // --------------------------------------------------
      // REMOVE REVIEW FROM UI
      // --------------------------------------------------

      setReviews((current) =>
        current.filter(
          (review) =>
            review._id !== reviewId
        )
      );

      // --------------------------------------------------
      // UPDATE RATING / COUNT
      // --------------------------------------------------

      const newAverage =
        Number(data.averageRating) || 0;

      const newTotal =
        Number(data.totalReviews) || 0;

      setAverageRating(newAverage);
      setTotalReviews(newTotal);

      setProduct((current) => {
        if (!current) return current;

        return {
          ...current,
          rating: newAverage,
          reviews: newTotal,
        };
      });

    } catch (error) {
      console.error(
        "Delete Review Error:",
        error
      );

      setReviewError(
        error.message ||
          "Unable to delete review."
      );
    }
  };

  // ======================================================
  // STAR DISPLAY
  // ======================================================

  const renderStars = (
    rating,
    interactive = false
  ) => {
    const roundedRating =
      Math.round(Number(rating) || 0);

    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map(
          (star) => (
            <button
              key={star}
              type={
                interactive
                  ? "button"
                  : undefined
              }
              onClick={
                interactive
                  ? () =>
                      setSelectedRating(
                        star
                      )
                  : undefined
              }
              className={`text-xl transition ${
                interactive
                  ? "cursor-pointer hover:scale-110"
                  : "cursor-default"
              } ${
                star <= roundedRating
                  ? "text-gray-900"
                  : "text-gray-300"
              }`}
              aria-label={
                interactive
                  ? `Give ${star} star${
                      star > 1
                        ? "s"
                        : ""
                    }`
                  : undefined
              }
            >
              ★
            </button>
          )
        )}
      </div>
    );
  };

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f7f7] flex items-center justify-center px-6">
        <div className="text-center">

          <div className="w-12 h-12 border-4 border-gray-300 border-t-[#171717] rounded-full animate-spin mx-auto" />

          <h2 className="text-xl font-bold text-gray-900 mt-5">
            Loading Product...
          </h2>

          <p className="text-sm text-gray-500 mt-2">
            Please wait
          </p>

        </div>
      </div>
    );
  }

  // ======================================================
  // ERROR / PRODUCT NOT FOUND
  // ======================================================

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#f7f7f7] flex items-center justify-center px-6">

        <div className="max-w-md w-full bg-white border border-gray-200 rounded-3xl p-10 text-center shadow-sm">

          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-2xl font-bold text-gray-700">
            !
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mt-5">
            Product Not Found
          </h1>

          <p className="text-gray-500 mt-3">
            {error ||
              "The requested product could not be found."}
          </p>

          <Link
            to="/products"
            className="inline-flex items-center justify-center mt-6 px-6 py-3 bg-[#171717] text-white rounded-xl font-semibold hover:bg-black transition"
          >
            Back to Products
          </Link>

        </div>

      </div>
    );
  }

  // ======================================================
  // PRODUCT VALUES
  // ======================================================

  const price =
    Number(product.price) || 0;

  const oldPrice =
    Number(product.oldPrice) || 0;

  const stock =
    Number(product.stock) || 0;

  const productRating =
    Number(averageRating) > 0
      ? Number(averageRating)
      : Number(product.rating) || 0;

  const productReviewCount =
    totalReviews > 0
      ? totalReviews
      : Number(product.reviews) || 0;

  const discount =
    oldPrice > price
      ? Math.round(
          ((oldPrice - price) /
            oldPrice) *
            100
        )
      : 0;

  // ======================================================
  // MAIN PAGE
  // ======================================================

  return (
    <div className="min-h-screen bg-[#f7f7f7]">

      {/* ==================================================
          BREADCRUMB
      ================================================== */}

      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-5">

        <div className="text-sm text-gray-500 flex flex-wrap items-center">

          <Link
            to="/"
            className="hover:text-gray-900 transition"
          >
            Home
          </Link>

          <span className="mx-2">
            /
          </span>

          <Link
            to="/products"
            className="hover:text-gray-900 transition"
          >
            Products
          </Link>

          <span className="mx-2">
            /
          </span>

          <span className="text-gray-900 truncate max-w-[250px]">
            {product.name}
          </span>

        </div>

      </div>


      {/* ==================================================
          PRODUCT DETAILS
      ================================================== */}

      <main className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 pb-16">

        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">

          <div className="grid grid-cols-1 lg:grid-cols-2">

            {/* ==================================================
                PRODUCT IMAGE
            ================================================== */}

            <div className="bg-[#f3f3f3] min-h-[450px] lg:min-h-[600px] flex items-center justify-center p-8 sm:p-10 lg:p-14">

              <div className="relative w-full h-full flex items-center justify-center">

                {discount > 0 && (
                  <span className="absolute top-0 left-0 z-10 bg-[#171717] text-white text-xs font-bold px-4 py-2 rounded-full">
                    {discount}% OFF
                  </span>
                )}

                <img
                  src={product.image}
                  alt={
                    product.name ||
                    "Product"
                  }
                  onError={
                    handleImageError
                  }
                  className="w-full max-w-xl h-[400px] sm:h-[480px] object-contain"
                />

              </div>

            </div>


            {/* ==================================================
                PRODUCT INFORMATION
            ================================================== */}

            <div className="p-7 sm:p-9 lg:p-12">

              {/* CATEGORY */}

              <p className="text-xs uppercase tracking-[0.18em] font-bold text-gray-400">
                {product.category ||
                  "Electronics"}
              </p>


              {/* NAME */}

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight mt-3">
                {product.name}
              </h1>


              {/* RATING */}

              <div className="flex flex-wrap items-center gap-3 mt-5">

                {renderStars(
                  productRating
                )}

                <span className="font-semibold text-gray-900">
                  {productRating.toFixed(
                    1
                  )}
                </span>

                <span className="text-gray-400">
                  •
                </span>

                <span className="text-gray-500">
                  {productReviewCount}{" "}
                  {productReviewCount ===
                  1
                    ? "review"
                    : "reviews"}
                </span>

              </div>


              {/* PRICE */}

              <div className="flex flex-wrap items-center gap-3 mt-7">

                <span className="text-4xl font-bold text-gray-900">
                  $
                  {price.toFixed(2)}
                </span>

                {oldPrice > price && (
                  <span className="text-lg text-gray-400 line-through">
                    $
                    {oldPrice.toFixed(
                      2
                    )}
                  </span>
                )}

              </div>


              {/* DESCRIPTION */}

              <p className="text-gray-600 leading-7 mt-6">
                {product.description ||
                  "Experience high-quality electronics from a trusted marketplace seller. This product is carefully selected for customers looking for reliable technology and excellent performance."}
              </p>


              {/* SELLER */}

              <div className="bg-[#f7f7f7] rounded-2xl p-5 mt-7">

                <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
                  Sold by
                </p>

                <p className="font-bold text-gray-900 text-lg mt-1">
                  {product.vendor ||
                    "Marketplace Vendor"}
                </p>

                <div className="flex items-center gap-2 mt-2">

                  <span className="text-gray-700 font-semibold text-sm">
                    ✓ Verified Seller
                  </span>

                </div>

              </div>


              {/* STOCK */}

              <div className="mt-6 flex flex-wrap items-center gap-3">

                <span
                  className={`font-semibold ${
                    stock > 0
                      ? "text-gray-700"
                      : "text-gray-400"
                  }`}
                >
                  {stock > 0
                    ? "✓ In Stock"
                    : "Out of Stock"}
                </span>

                {stock > 0 && (
                  <>
                    <span className="text-gray-300">
                      •
                    </span>

                    <span className="text-gray-500">
                      {stock} available
                    </span>
                  </>
                )}

              </div>


              {/* QUANTITY */}

              {stock > 0 && (
                <div className="flex items-center gap-4 mt-7">

                  <span className="font-semibold text-gray-900">
                    Quantity:
                  </span>

                  <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden">

                    <button
                      type="button"
                      onClick={
                        decreaseQuantity
                      }
                      disabled={
                        quantity <= 1
                      }
                      className="w-11 h-11 flex items-center justify-center text-xl hover:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed transition"
                    >
                      −
                    </button>

                    <span className="w-12 h-11 flex items-center justify-center border-x border-gray-300 font-semibold">
                      {quantity}
                    </span>

                    <button
                      type="button"
                      onClick={
                        increaseQuantity
                      }
                      disabled={
                        quantity >= stock
                      }
                      className="w-11 h-11 flex items-center justify-center text-xl hover:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed transition"
                    >
                      +
                    </button>

                  </div>

                </div>
              )}


              {/* BUTTONS */}

              <div className="flex flex-col sm:flex-row gap-3 mt-8">

                <button
                  type="button"
                  onClick={
                    handleAddToCart
                  }
                  disabled={
                    stock <= 0
                  }
                  className={`flex-1 py-4 rounded-xl font-bold text-base transition ${
                    stock > 0
                      ? "bg-[#171717] text-white hover:bg-black"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {stock > 0
                    ? "Add to Cart"
                    : "Sold Out"}
                </button>

                <button
                  type="button"
                  onClick={
                    handleBuyNow
                  }
                  disabled={
                    stock <= 0
                  }
                  className={`flex-1 py-4 rounded-xl font-bold text-base transition ${
                    stock > 0
                      ? "bg-gray-200 text-gray-900 hover:bg-gray-300"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Buy Now
                </button>

              </div>


              {/* FEATURES */}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-8">

                <div className="border border-gray-200 rounded-xl p-4 text-center">

                  <div className="text-xl">
                    🚚
                  </div>

                  <p className="font-semibold text-sm mt-2">
                    Fast Delivery
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    Quick shipping
                  </p>

                </div>

                <div className="border border-gray-200 rounded-xl p-4 text-center">

                  <div className="text-xl">
                    🔒
                  </div>

                  <p className="font-semibold text-sm mt-2">
                    Secure Payment
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    Safe checkout
                  </p>

                </div>

                <div className="border border-gray-200 rounded-xl p-4 text-center">

                  <div className="text-xl">
                    ↩️
                  </div>

                  <p className="font-semibold text-sm mt-2">
                    Easy Returns
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    Customer friendly
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>


        {/* ==================================================
            PRODUCT INFORMATION
        ================================================== */}

        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 mt-8 p-6 sm:p-8">

          <h2 className="text-2xl font-bold text-gray-900">
            Product Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">

            <div className="border border-gray-200 rounded-xl p-5">

              <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
                Category
              </p>

              <p className="font-semibold text-gray-900 mt-1">
                {product.category ||
                  "Electronics"}
              </p>

            </div>

            <div className="border border-gray-200 rounded-xl p-5">

              <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
                Seller
              </p>

              <p className="font-semibold text-gray-900 mt-1">
                {product.vendor ||
                  "Marketplace Vendor"}
              </p>

            </div>

            <div className="border border-gray-200 rounded-xl p-5">

              <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
                Customer Rating
              </p>

              <p className="font-semibold text-gray-900 mt-1">
                ⭐{" "}
                {productRating.toFixed(
                  1
                )}{" "}
                / 5
              </p>

            </div>

            <div className="border border-gray-200 rounded-xl p-5">

              <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
                Customer Reviews
              </p>

              <p className="font-semibold text-gray-900 mt-1">
                {productReviewCount}{" "}
                {productReviewCount ===
                1
                  ? "Review"
                  : "Reviews"}
              </p>

            </div>

            <div className="border border-gray-200 rounded-xl p-5">

              <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
                Availability
              </p>

              <p
                className={`font-semibold mt-1 ${
                  stock > 0
                    ? "text-gray-700"
                    : "text-gray-400"
                }`}
              >
                {stock > 0
                  ? "In Stock"
                  : "Out of Stock"}
              </p>

            </div>

            <div className="border border-gray-200 rounded-xl p-5">

              <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
                Stock
              </p>

              <p className="font-semibold text-gray-900 mt-1">
                {stock} units
              </p>

            </div>

          </div>

        </div>


        {/* ==================================================
            REVIEWS
        ================================================== */}

        <section className="bg-white rounded-3xl shadow-sm border border-gray-200 mt-8 p-6 sm:p-8">

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5">

            <div>

              <p className="text-xs uppercase tracking-[0.18em] font-bold text-gray-400">
                Customer Feedback
              </p>

              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">
                Customer Reviews
              </h2>

            </div>


            {/* RATING SUMMARY */}

            <div className="flex items-center gap-4">

              <div className="text-center">

                <p className="text-3xl font-bold text-gray-900">
                  {productRating.toFixed(
                    1
                  )}
                </p>

                <div className="flex justify-center mt-1">
                  {renderStars(
                    productRating
                  )}
                </div>

                <p className="text-xs text-gray-500 mt-1">
                  {productReviewCount}{" "}
                  reviews
                </p>

              </div>

            </div>

          </div>


          {/* ==================================================
              REVIEW ERROR
          ================================================== */}

          {reviewError && (
            <div className="mt-6 bg-gray-100 border border-gray-200 text-gray-700 rounded-xl px-4 py-3 text-sm">
              {reviewError}
            </div>
          )}


          {/* ==================================================
              ADD REVIEW FORM
          ================================================== */}

          <div className="mt-8 border border-gray-200 rounded-2xl p-5 sm:p-6">

            <h3 className="text-lg font-bold text-gray-900">
              Write a Review
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              Share your experience with this product.
            </p>

            <form
              onSubmit={
                handleSubmitReview
              }
              className="mt-5"
            >

              {/* RATING */}

              <div>

                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Rating
                </label>

                <div className="flex items-center gap-1">

                  {[1, 2, 3, 4, 5].map(
                    (star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() =>
                          setSelectedRating(
                            star
                          )
                        }
                        className={`text-3xl transition-transform hover:scale-110 ${
                          star <=
                          selectedRating
                            ? "text-gray-900"
                            : "text-gray-300"
                        }`}
                        aria-label={`Rate ${star} stars`}
                      >
                        ★
                      </button>
                    )
                  )}

                </div>

                {selectedRating > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    You selected{" "}
                    {selectedRating}{" "}
                    star
                    {selectedRating >
                    1
                      ? "s"
                      : ""}
                  </p>
                )}

              </div>


              {/* COMMENT */}

              <div className="mt-5">

                <label
                  htmlFor="review-comment"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Your Review
                </label>

                <textarea
                  id="review-comment"
                  value={comment}
                  onChange={(event) =>
                    setComment(
                      event.target.value
                    )
                  }
                  rows="5"
                  placeholder="Write your review here..."
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none resize-none text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition"
                />

              </div>


              {/* SUBMIT */}

              <button
                type="submit"
                disabled={
                  submittingReview
                }
                className={`mt-5 px-6 py-3 rounded-xl font-semibold text-sm transition ${
                  submittingReview
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-[#171717] text-white hover:bg-black"
                }`}
              >
                {submittingReview
                  ? "Submitting..."
                  : "Submit Review"}
              </button>

            </form>

          </div>


          {/* ==================================================
              REVIEWS LIST
          ================================================== */}

          <div className="mt-8">

            <div className="flex items-center justify-between gap-4 mb-5">

              <h3 className="text-lg font-bold text-gray-900">
                {productReviewCount}{" "}
                {productReviewCount ===
                1
                  ? "Review"
                  : "Reviews"}
              </h3>

            </div>


            {reviewsLoading ? (

              <div className="border border-gray-200 rounded-2xl p-8 text-center">

                <div className="w-8 h-8 border-4 border-gray-300 border-t-[#171717] rounded-full animate-spin mx-auto" />

                <p className="text-sm text-gray-500 mt-3">
                  Loading reviews...
                </p>

              </div>

            ) : reviews.length === 0 ? (

              <div className="border border-dashed border-gray-300 rounded-2xl p-8 text-center">

                <div className="text-3xl">
                  ☆
                </div>

                <h4 className="font-bold text-gray-900 mt-3">
                  No reviews yet
                </h4>

                <p className="text-sm text-gray-500 mt-1">
                  Be the first customer to review this product.
                </p>

              </div>

            ) : (

              <div className="space-y-4">

                {reviews.map(
                  (review) => {

                    const reviewRating =
                      Number(
                        review.rating
                      ) || 0;

                    return (
                      <article
                        key={
                          review._id
                        }
                        className="border border-gray-200 rounded-2xl p-5 sm:p-6"
                      >

                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">

                          <div>

                            <div className="flex items-center gap-2">

                              <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-700">
                                ★
                              </div>

                              <div>

                                <p className="font-semibold text-gray-900">
                                  Customer
                                </p>

                                <p className="text-xs text-gray-400">
                                  Verified Review
                                </p>

                              </div>

                            </div>

                          </div>


                          <div className="flex items-center gap-3">

                            {renderStars(
                              reviewRating
                            )}

                            <span className="text-xs font-semibold text-gray-500">
                              {reviewRating.toFixed(
                                1
                              )}
                            </span>

                          </div>

                        </div>


                        <p className="text-gray-600 text-sm leading-7 mt-5">
                          {review.comment}
                        </p>


                        <div className="flex flex-wrap items-center justify-between gap-3 mt-5 pt-4 border-t border-gray-100">

                          <p className="text-xs text-gray-400">

                            {review.createdAt
                              ? new Date(
                                  review.createdAt
                                ).toLocaleDateString()
                              : "Recently"}

                          </p>

                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteReview(
                                review._id
                              )
                            }
                            className="text-xs font-semibold text-gray-500 hover:text-black transition"
                          >
                            Delete Review
                          </button>

                        </div>

                      </article>
                    );
                  }
                )}

              </div>

            )}

          </div>

        </section>

      </main>

    </div>
  );
}

export default ProductDetails;
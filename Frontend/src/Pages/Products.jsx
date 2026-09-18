
import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import useCartStore from "../store/cartstore";

function Products() {
  // ==========================================
  // URL SEARCH
  // ==========================================

  const [searchParams] = useSearchParams();

  const searchQuery = searchParams.get("search") || "";

  // ==========================================
  // PRODUCTS
  // ==========================================

  const [products, setProducts] = useState([]);

  // ==========================================
  // FILTERS
  // ==========================================

  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("default");

  // ==========================================
  // CATEGORIES
  // ==========================================

  const [categories] = useState([
    "All",
    "Smartphones",
    "Laptops",
    "Audio",
    "Wearables",
    "Gaming",
    "Cameras",
    "Accessories",
    "Tablets",
  ]);

  // ==========================================
  // PAGINATION
  // ==========================================

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const productsPerPage = 16;

  // ==========================================
  // LOADING
  // ==========================================

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // CART
  // ==========================================

  const addToCart = useCartStore(
    (state) => state.addToCart
  );

  // ==========================================
  // RESET PAGE WHEN SEARCH CHANGES
  // ==========================================

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // ==========================================
  // FETCH PRODUCTS
  // ==========================================

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams();

        // PAGE
        params.append("page", currentPage);

        // LIMIT
        params.append("limit", productsPerPage);

        // SEARCH
        if (searchQuery.trim()) {
          params.append(
            "search",
            searchQuery.trim()
          );
        }

        // CATEGORY
        if (
          category &&
          category !== "All"
        ) {
          params.append(
            "category",
            category
          );
        }

        // SORT
        if (sort !== "default") {
          params.append("sort", sort);
        }

        const response = await fetch(
          `http://localhost:5000/api/products?${params.toString()}`
        );

        if (!response.ok) {
          throw new Error(
            "Failed to fetch products"
          );
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(
            data.message ||
              "Unable to fetch products"
          );
        }

        setProducts(
          data.products || []
        );

        setTotalProducts(
          data.totalProducts || 0
        );

        setTotalPages(
          data.totalPages || 1
        );

        if (
          data.currentPage &&
          data.currentPage !== currentPage
        ) {
          setCurrentPage(
            data.currentPage
          );
        }

      } catch (error) {
        console.error(
          "Products Error:",
          error
        );

        setError(
          "Unable to load products. Please check your backend server."
        );

      } finally {
        setLoading(false);
      }
    };

    fetchProducts();

  }, [
    currentPage,
    category,
    sort,
    searchQuery,
  ]);

  // ==========================================
  // ADD TO CART
  // ==========================================

  const handleAddToCart = (product) => {
    addToCart(product);

    alert(
      `${product.name} added to cart!`
    );
  };

  // ==========================================
  // CHANGE PAGE
  // ==========================================

  const changePage = (page) => {
    if (
      page < 1 ||
      page > totalPages ||
      page === currentPage
    ) {
      return;
    }

    setCurrentPage(page);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ==========================================
  // CLEAR FILTERS
  // ==========================================

  const clearFilters = () => {
    setCategory("All");
    setSort("default");
    setCurrentPage(1);
  };

  // ==========================================
  // IMAGE ERROR
  // ==========================================

  const handleImageError = (event) => {
    event.currentTarget.src =
      "https://placehold.co/600x500/f3f3f3/171717?text=Product";
  };

  // ==========================================
  // LOADING SCREEN
  // ==========================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f7f7] flex items-center justify-center px-6">

        <div className="text-center">

          <div className="w-12 h-12 border-4 border-gray-300 border-t-[#171717] rounded-full animate-spin mx-auto" />

          <h2 className="text-xl font-bold text-gray-900 mt-5">
            Loading Products...
          </h2>

          <p className="text-sm text-gray-500 mt-2">
            Please wait
          </p>

        </div>

      </div>
    );
  }

  // ==========================================
  // ERROR SCREEN
  // ==========================================

  if (error) {
    return (
      <div className="min-h-screen bg-[#f7f7f7] flex items-center justify-center px-6">

        <div className="max-w-md w-full bg-white border border-gray-200 rounded-3xl p-10 text-center shadow-sm">

          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-2xl font-bold text-gray-700">
            !
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mt-5">
            Something went wrong
          </h2>

          <p className="text-gray-500 mt-3">
            {error}
          </p>

          <button
            onClick={() =>
              window.location.reload()
            }
            className="mt-6 px-6 py-3 bg-[#171717] text-white rounded-xl font-semibold hover:bg-black transition"
          >
            Try Again
          </button>

        </div>

      </div>
    );
  }

  // ==========================================
  // MAIN PAGE
  // ==========================================

  return (
    <div className="min-h-screen bg-[#f7f7f7]">

      {/* ======================================
          HERO
      ====================================== */}

      <section className="bg-[#171717] text-white">

        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-14 md:py-18">

          <p className="text-gray-400 text-xs font-bold uppercase tracking-[0.25em]">
            ElectroMarket
          </p>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mt-3">
            {searchQuery
              ? "Search Results"
              : "All Electronics"}
          </h1>

          <p className="max-w-2xl text-gray-400 mt-5 text-base md:text-lg leading-relaxed">

            {searchQuery
              ? `Products matching "${searchQuery}"`
              : "Discover quality electronics from trusted marketplace vendors."}

          </p>

        </div>

      </section>


      {/* ======================================
          FILTER AREA
      ====================================== */}

      <section className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 -mt-7 relative z-10">

        <div className="bg-white border border-gray-200 rounded-3xl p-5 md:p-7 shadow-lg">

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">

            {/* ==================================
                CATEGORIES
            ================================== */}

            <div className="flex-1 min-w-0">

              <label className="block text-sm font-semibold uppercase tracking-[0.16em] text-gray-500 mb-3">
                Categories
              </label>

              <div
                className="
                  flex
                  items-center
                  gap-2
                  overflow-x-auto
                  pb-1
                  [scrollbar-width:none]
                  [&::-webkit-scrollbar]:hidden
                "
              >

                {categories.map(
                  (item) => (
                    <button
                      key={item}
                      onClick={() => {
                        setCategory(item);
                        setCurrentPage(1);
                      }}
                      className={`
                        shrink-0
                        px-5
                        py-2.5
                        rounded-lg
                        text-base
                        font-medium
                        whitespace-nowrap
                        transition-all
                        duration-200
                        border
                        ${
                          category === item
                            ? `
                              bg-[#171717]
                              text-white
                              border-[#171717]
                              shadow-sm
                            `
                            : `
                              bg-white
                              text-gray-700
                              border-gray-900
                              hover:bg-gray-100
                              hover:text-gray-900
                            `
                        }
                      `}
                    >
                      {item}
                    </button>
                  )
                )}

              </div>

            </div>


            {/* ==================================
                SORT
            ================================== */}

            <div className="w-full sm:w-64 lg:w-60 shrink-0">

              <label className="block text-sm font-semibold uppercase tracking-[0.16em] text-gray-500 mb-3">
                Sort By
              </label>

              <select
                value={sort}
                onChange={(event) => {
                  setSort(
                    event.target.value
                  );
                  setCurrentPage(1);
                }}
                className="
                  w-full
                  h-[44px]
                  px-5
                  bg-white
                  border
                  border-gray-900
                  rounded-lg
                  outline-none
                  text-base
                  font-medium
                  text-gray-700
                  focus:bg-gray-50
                  focus:border-black
                  transition
                  cursor-pointer
                "
              >

                <option value="default">
                  Default
                </option>

                <option value="price-low">
                  Price: Low to High
                </option>

                <option value="price-high">
                  Price: High to Low
                </option>

                <option value="rating">
                  Highest Rated
                </option>

              </select>

            </div>

          </div>

        </div>

      </section>


      {/* ======================================
          PRODUCTS SECTION
      ====================================== */}

      <section className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 pt-8 pb-16">

        {/* ====================================
            HEADER
        ==================================== */}

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-7">

          <div>

            <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">
              Marketplace
            </p>

            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-1">

              {searchQuery
                ? `Results for "${searchQuery}"`
                : category === "All"
                ? "All Electronics"
                : category}

            </h2>

          </div>


          <p className="text-sm text-gray-500">

            Showing{" "}

            <span className="font-bold text-gray-900">
              {products.length}
            </span>

            {" "}of{" "}

            <span className="font-bold text-gray-900">
              {totalProducts}
            </span>

            {" "}products

          </p>

        </div>


        {/* ====================================
            PRODUCT GRID
        ==================================== */}

        {products.length > 0 ? (

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">

            {products.map(
              (product) => {

                const price =
                  Number(
                    product.price
                  ) || 0;

                const oldPrice =
                  Number(
                    product.oldPrice
                  ) || 0;

                const rating =
                  Number(
                    product.rating
                  ) || 0;

                const stock =
                  Number(
                    product.stock
                  ) || 0;

                const discount =
                  oldPrice > price
                    ? Math.round(
                        ((oldPrice -
                          price) /
                          oldPrice) *
                          100
                      )
                    : 0;

                return (

                  <article
                    key={
                      product._id ||
                      product.id
                    }
                    className="
                      group
                      bg-white
                      border
                      border-gray-200
                      rounded-2xl
                      overflow-hidden
                      hover:border-gray-300
                      hover:shadow-xl
                      transition-all
                      duration-300
                      flex
                      flex-col
                    "
                  >

                    {/* ==================================
                        IMAGE
                    ================================== */}

                    <div className="relative h-64 bg-[#f3f3f3] overflow-hidden flex items-center justify-center">

                      {discount > 0 && (
                        <span className="absolute top-4 left-4 z-10 bg-[#171717] text-white text-[11px] font-bold px-3 py-1.5 rounded-full">
                          {discount}% OFF
                        </span>
                      )}

                      <div className="w-full h-full p-8 flex items-center justify-center">

                        <img
                          src={
                            product.image
                          }
                          alt={
                            product.name ||
                            "Product"
                          }
                          loading="lazy"
                          onError={
                            handleImageError
                          }
                          className="
                            max-w-full
                            max-h-full
                            w-auto
                            h-auto
                            object-contain
                            group-hover:scale-105
                            transition-transform
                            duration-500
                          "
                        />

                      </div>

                    </div>


                    {/* ==================================
                        PRODUCT INFORMATION
                    ================================== */}

                    <div className="p-7 md:p-8 flex flex-col flex-1">

                      {/* CATEGORY */}

                      <p className="text-[11px] uppercase tracking-wider font-bold text-gray-400">
                        {product.category ||
                          "Electronics"}
                      </p>


                      {/* NAME */}

                      <h3 className="text-base md:text-lg font-bold text-gray-900 mt-2 line-clamp-2 min-h-[48px]">
                        {product.name ||
                          "Unnamed Product"}
                      </h3>


                      {/* RATING */}

                      <div className="flex items-center gap-2 mt-4">

                        <span className="text-sm text-gray-900 tracking-tight">

                          {"★".repeat(
                            Math.min(
                              5,
                              Math.max(
                                0,
                                Math.round(
                                  rating
                                )
                              )
                            )
                          )}

                        </span>

                        <span className="text-xs text-gray-500">
                          {rating.toFixed(1)}
                        </span>

                        {product.reviews ? (
                          <span className="text-xs text-gray-400">
                            (
                            {
                              product.reviews
                            }
                            )
                          </span>
                        ) : null}

                      </div>


                      {/* VENDOR */}

                      <p className="text-xs text-gray-500 mt-4">

                        Sold by{" "}

                        <span className="font-semibold text-gray-800">
                          {product.vendor ||
                            "Marketplace Vendor"}
                        </span>

                      </p>


                      {/* PRICE */}

                      <div className="flex items-center gap-3 mt-4">

                        <span className="text-xl md:text-2xl font-bold text-gray-950">
                          $
                          {price.toFixed(
                            2
                          )}
                        </span>

                        {oldPrice >
                          price && (
                          <span className="text-sm text-gray-400 line-through">
                            $
                            {oldPrice.toFixed(
                              2
                            )}
                          </span>
                        )}

                      </div>


                      {/* STOCK */}

                      <p
                        className={`text-xs font-semibold mt-2 ${
                          stock > 0
                            ? "text-gray-600"
                            : "text-gray-400"
                        }`}
                      >
                        {stock > 0
                          ? `${stock} available`
                          : "Out of stock"}
                      </p>


                      {/* ==================================
                          BUTTONS
                      ================================== */}

                      <div className="grid grid-cols-2 gap-3 mt-auto pt-7">

                        {/* DETAILS */}

                        <Link
                          to={`/products/${product.id}`}
                          className="
                            h-11
                            flex
                            items-center
                            justify-center
                            rounded-xl
                            border
                            border-gray-900
                            text-gray-900
                            text-sm
                            font-bold
                            hover:bg-gray-100
                            transition
                          "
                        >
                          Details
                        </Link>


                        {/* ADD TO CART */}

                        <button
                          onClick={() =>
                            handleAddToCart(
                              product
                            )
                          }
                          disabled={
                            stock <= 0
                          }
                          className={`
                            h-11
                            rounded-xl
                            text-sm
                            font-bold
                            transition
                            ${
                              stock > 0
                                ? "bg-[#171717] text-white hover:bg-black"
                                : "bg-gray-100 text-gray-400 cursor-not-allowed"
                            }
                          `}
                        >
                          {stock > 0
                            ? "Add to Cart"
                            : "Sold Out"}
                        </button>

                      </div>

                    </div>

                  </article>

                );
              }
            )}

          </div>

        ) : (

          /* ====================================
             NO PRODUCTS
          ==================================== */

          <div className="bg-white border border-gray-200 rounded-3xl p-12 md:p-20 text-center">

            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-2xl">
              ⌕
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mt-5">

              {searchQuery
                ? "No Search Results"
                : "No Products Found"}

            </h2>

            <p className="text-gray-500 mt-2">

              {searchQuery
                ? `No products found for "${searchQuery}". Try another search.`
                : "Try another category."}

            </p>

            <button
              onClick={clearFilters}
              className="mt-6 px-7 py-3 bg-[#171717] text-white rounded-xl font-semibold hover:bg-black transition"
            >
              Clear Filters
            </button>

          </div>

        )}


        {/* ====================================
            PAGINATION
        ==================================== */}

        {totalPages > 1 && (

          <div className="mt-12 pt-7 border-t border-gray-200">

            <div className="flex flex-wrap justify-center items-center gap-2">

              {/* PREVIOUS */}

              <button
                onClick={() =>
                  changePage(
                    currentPage - 1
                  )
                }
                disabled={
                  currentPage === 1
                }
                className={`h-10 px-4 rounded-xl border text-sm font-semibold transition ${
                  currentPage === 1
                    ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                    : "bg-white text-gray-700 border-gray-300 hover:border-gray-900 hover:text-black"
                }`}
              >
                ← Previous
              </button>


              {/* PAGE NUMBERS */}

              {Array.from(
                {
                  length: totalPages,
                },
                (_, index) =>
                  index + 1
              )
                .filter(
                  (page) =>
                    page === 1 ||
                    page === totalPages ||
                    Math.abs(
                      page -
                        currentPage
                    ) <= 1
                )
                .map(
                  (
                    page,
                    index,
                    pages
                  ) => {

                    const previous =
                      pages[index - 1];

                    const showDots =
                      previous &&
                      page -
                        previous >
                        1;

                    return (
                      <React.Fragment
                        key={page}
                      >

                        {showDots && (
                          <span className="px-1 text-gray-400">
                            ...
                          </span>
                        )}

                        <button
                          onClick={() =>
                            changePage(
                              page
                            )
                          }
                          className={`min-w-10 h-10 px-3 rounded-xl text-sm font-bold transition ${
                            currentPage ===
                            page
                              ? "bg-[#171717] text-white"
                              : "bg-white text-gray-700 border border-gray-200 hover:border-gray-900 hover:text-black"
                          }`}
                        >
                          {page}
                        </button>

                      </React.Fragment>
                    );
                  }
                )}

              {/* NEXT */}

              <button
                onClick={() =>
                  changePage(
                    currentPage + 1
                  )
                }
                disabled={
                  currentPage ===
                  totalPages
                }
                className={`h-10 px-4 rounded-xl border text-sm font-semibold transition ${
                  currentPage ===
                  totalPages
                    ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                    : "bg-white text-gray-700 border-gray-300 hover:border-gray-900 hover:text-black"
                }`}
              >
                Next →
              </button>

            </div>


            {/* PAGE INFO */}

            <p className="text-center text-xs text-gray-400 mt-4">

              Page{" "}

              <span className="font-bold text-gray-700">
                {currentPage}
              </span>

              {" "}of{" "}

              <span className="font-bold text-gray-700">
                {totalPages}
              </span>

            </p>

          </div>

        )}

      </section>

    </div>
  );
}

export default Products;


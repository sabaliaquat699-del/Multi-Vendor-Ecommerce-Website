import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import useCartStore from "../store/cartstore";

function Navbar() {
  const cart = useCartStore((state) => state.cart);

  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  // Mobile menu state
  const [menuOpen, setMenuOpen] = useState(false);

  // Search state
  const [search, setSearch] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  // ==========================================
  // SEARCH
  // ==========================================

  const handleSearch = (event) => {
    event.preventDefault();

    const value = search.trim();

    if (value) {
      navigate(`/products?search=${encodeURIComponent(value)}`);
    } else {
      navigate("/products");
    }

    setMenuOpen(false);
  };

  // ==========================================
  // SEARCH CHANGE
  // ==========================================

  const handleSearchChange = (event) => {
    const value = event.target.value;

    setSearch(value);

    // If search is completely cleared
    if (value.trim() === "") {
      if (location.pathname === "/products") {
        navigate("/products");
      }
    }
  };

  // ==========================================
  // CLEAR SEARCH WHEN LEAVING PRODUCTS
  // ==========================================

  const handleLogoClick = () => {
    setSearch("");
    setMenuOpen(false);
  };

  const handleProductsClick = () => {
    setSearch("");
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-gray-700 shadow-md">
      <div className="w-full px-6 sm:px-8 lg:px-10">

        <div className="flex min-h-[88px] items-center gap-6">

          {/* ================= LOGO ================= */}

          <Link
            to="/"
            className="shrink-0 px-2 py-3"
            onClick={handleLogoClick}
          >
            <span className="text-2xl font-bold font-[Pacifico] tracking-tight text-white transition duration-200 hover:text-black sm:text-3xl">
              NextTech
            </span>
          </Link>


          {/* ================= SEARCH BAR ================= */}

          <form
            onSubmit={handleSearch}
            className="hidden flex-1 md:flex md:max-w-[350px] lg:max-w-[390px]"
          >

            <div className="flex h-14 w-full items-center rounded-full bg-gray-100 px-5 shadow-sm">

              {/* Search Input */}

              <input
                type="text"
                value={search}
                onChange={handleSearchChange}
                placeholder="What are you looking for?"
                className="min-w-0 flex-1 bg-transparent text-base text-gray-800 outline-none placeholder:text-gray-500"
              />

              {/* Search Button */}

              <button
                type="submit"
                title="Search"
                className="ml-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-700 text-lg text-white transition duration-200 hover:bg-gray-500 hover:text-black"
              >
                🔍
              </button>

            </div>

          </form>


          {/* ================= NAVIGATION ================= */}

          <nav className="hidden flex-1 items-center justify-center gap-6 lg:flex xl:gap-8">

            <Link
              to="/"
              className="whitespace-nowrap text-base font-semibold text-white transition duration-200 hover:text-black"
            >
              Home
            </Link>

            <Link
              to="/products"
              onClick={handleProductsClick}
              className="whitespace-nowrap text-base font-semibold text-white transition duration-200 hover:text-black"
            >
              Products
            </Link>

            <Link
              to="/categories"
              className="whitespace-nowrap text-base font-semibold text-white transition duration-200 hover:text-black"
            >
              Categories
            </Link>

            <Link
              to="/stores"
              className="whitespace-nowrap text-base font-semibold text-white transition duration-200 hover:text-black"
            >
              Stores
            </Link>

            <Link
              to="/deals"
              className="whitespace-nowrap text-base font-semibold text-white transition duration-200 hover:text-black"
            >
              Deals
            </Link>

            <Link
              to="/vendor"
              className="whitespace-nowrap text-base font-semibold text-white transition duration-200 hover:text-black"
            >
              Become a Seller
            </Link>

          </nav>


          {/* ================= RIGHT SIDE ================= */}

          <div className="ml-auto flex shrink-0 items-center gap-3">

            {/* Mobile Search */}

            <button
              type="button"
              title="Search"
              onClick={() => navigate("/products")}
              className="flex h-11 w-9 items-center justify-center rounded-full bg-gray-100 text-lg text-gray-700 transition duration-200 hover:bg-gray-300 md:hidden"
            >
              🔍
            </button>


            {/* Cart */}

            <Link
              to="/cart"
              title="Shopping Cart"
              className="relative flex h-11 w-11 items-center justify-center rounded-full text-2xl text-white transition duration-200 hover:bg-gray-500 hover:text-black"
            >
              🛒

              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>


            {/* ================= LOGIN ================= */}

            <Link
              to="/login"
              className="hidden rounded-xl border border-black bg-black px-12 py-4 text-base font-semibold text-white shadow-sm transition duration-200 hover:bg-gray-500 hover:text-black sm:block"
            >
              Login
            </Link>


            {/* ================= REGISTER ================= */}

            <Link
              to="/register"
              className="hidden border rounded-xl border-black bg-black px-12 py-4 text-base font-semibold text-white shadow-sm transition duration-200 hover:bg-gray-500 hover:text-black sm:block"
            >
              Register
            </Link>


            {/* ================= MOBILE MENU BUTTON ================= */}

            <button
              type="button"
              title="Menu"
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex h-11 w-11 items-center justify-center rounded-lg border border-gray-500 text-xl text-white transition duration-200 hover:bg-gray-500 hover:text-black lg:hidden"
            >
              {menuOpen ? "✕" : "☰"}
            </button>

          </div>

        </div>


        {/* =========================================================
            MOBILE MENU
        ========================================================= */}

        {menuOpen && (
          <div className="border-t border-gray-600 py-5 lg:hidden">

            <nav className="flex flex-col gap-2">

              <Link
                to="/"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-5 py-3 text-base font-semibold text-white transition duration-200 hover:bg-gray-600 hover:text-black"
              >
                Home
              </Link>

              <Link
                to="/products"
                onClick={handleProductsClick}
                className="rounded-lg px-5 py-3 text-base font-semibold text-white transition duration-200 hover:bg-gray-600 hover:text-black"
              >
                Products
              </Link>

              <Link
                to="/categories"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-5 py-3 text-base font-semibold text-white transition duration-200 hover:bg-gray-600 hover:text-black"
              >
                Categories
              </Link>

              <Link
                to="/stores"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-5 py-3 text-base font-semibold text-white transition duration-200 hover:bg-gray-600 hover:text-black"
              >
                Stores
              </Link>

              <Link
                to="/deals"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-5 py-3 text-base font-semibold text-white transition duration-200 hover:bg-gray-600 hover:text-black"
              >
                Deals
              </Link>

              <Link
                to="/vendor"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-5 py-3 text-base font-semibold text-white transition duration-200 hover:bg-gray-600 hover:text-black"
              >
                Become a Seller
              </Link>


              {/* Mobile Login/Register */}

              <div className="mt-3 flex gap-3 border-t border-gray-600 pt-5">

                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="flex flex-1 items-center justify-center border border-black bg-black px-8 py-4 text-base font-semibold text-white shadow-sm transition duration-200 hover:bg-gray-500 hover:text-black"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  onClick={() => setMenuOpen(false)}
                  className="flex flex-1 items-center justify-center border border-black bg-black px-8 py-4 text-base font-semibold text-white shadow-sm transition duration-200 hover:bg-gray-500 hover:text-black"
                >
                  Register
                </Link>

              </div>

            </nav>

          </div>
        )}

      </div>
    </header>
  );
}

export default Navbar;
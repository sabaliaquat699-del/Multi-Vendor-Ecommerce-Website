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

  // Mobile search bar state (search icon on small screens)
  const [searchOpen, setSearchOpen] = useState(false);

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
    setSearchOpen(false);
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
    setSearchOpen(false);
  };

  const handleProductsClick = () => {
    setSearch("");
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-gray-700 shadow-md">
      <div className="w-full px-4 sm:px-6 xl:px-10">

        <div className="flex min-h-16 items-center gap-3 sm:gap-6 lg:min-h-[88px]">

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
            className="hidden min-w-0 flex-1 md:flex md:max-w-[350px] lg:max-w-[390px]"
          >

            <div className="flex h-12 w-full items-center rounded-full bg-gray-100 px-5 shadow-sm lg:h-14">

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

          <nav className="mx-auto hidden shrink-0 items-center gap-5 xl:flex 2xl:gap-8">

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
              aria-label="Search"
              aria-expanded={searchOpen}
              onClick={() => {
                setSearchOpen(!searchOpen);
                setMenuOpen(false);
              }}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-lg text-gray-700 transition duration-200 hover:bg-gray-300 md:hidden"
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
              className="hidden rounded-xl border border-black bg-black px-6 py-2.5 text-base font-semibold text-white shadow-sm transition duration-200 hover:bg-gray-500 hover:text-black sm:block 2xl:px-10 2xl:py-3.5"
            >
              Login
            </Link>


            {/* ================= REGISTER ================= */}

            <Link
              to="/register"
              className="hidden border rounded-xl border-black bg-black px-6 py-2.5 text-base font-semibold text-white shadow-sm transition duration-200 hover:bg-gray-500 hover:text-black sm:block 2xl:px-10 2xl:py-3.5"
            >
              Register
            </Link>


            {/* ================= MOBILE MENU BUTTON ================= */}

            <button
              type="button"
              title="Menu"
              aria-label="Menu"
              aria-expanded={menuOpen}
              onClick={() => {
                setMenuOpen(!menuOpen);
                setSearchOpen(false);
              }}
              className="flex h-11 w-11 items-center justify-center rounded-lg border border-gray-500 text-xl text-white transition duration-200 hover:bg-gray-500 hover:text-black xl:hidden"
            >
              {menuOpen ? "✕" : "☰"}
            </button>

          </div>

        </div>


        {/* =========================================================
            MOBILE SEARCH (small screens only)
        ========================================================= */}

        {searchOpen && (
          <form onSubmit={handleSearch} className="pb-3 md:hidden">

            <div className="flex h-11 w-full items-center rounded-full bg-gray-100 px-4 shadow-sm">

              <input
                type="text"
                enterKeyHint="search"
                autoFocus
                value={search}
                onChange={handleSearchChange}
                placeholder="What are you looking for?"
                className="min-w-0 flex-1 bg-transparent text-base text-gray-800 outline-none placeholder:text-gray-500"
              />

              <button
                type="submit"
                title="Search"
                aria-label="Search"
                className="ml-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-700 text-base text-white"
              >
                🔍
              </button>

            </div>

          </form>
        )}


        {/* =========================================================
            MOBILE MENU
        ========================================================= */}

        {menuOpen && (
          <div className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-gray-600 py-4 xl:hidden">

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
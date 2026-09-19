import { Link } from "react-router-dom";

import iphone from "../assets/Product/iphone.png";
import laptop from "../assets/Product/laptop.png";
import headphone from "../assets/Product/headphone.png";
import smartwatch from "../assets/Product/smartwatch.png";
import camera from "../assets/Product/camera.png";
import latestelectronics from "../assets/Product/latestelectronics.png";
import gaming from "../assets/Product/gaming.png"

function Home() {
  const categories = [
    {
      name: "Smartphones",
      image: iphone,
    },
    {
      name: "Laptops",
      image: laptop,
    },
    {
      name: "Audio",
      image: headphone,
    },
    {
      name: "Wearables",
      image: smartwatch,
    },
    {
      name: "Cameras",
      image: camera,
    },
    {
      name: "Gaming",
      image: gaming,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-700 text-white">

      {/* =========================================================
          HERO SECTION
      ========================================================= */}
      <section className="relative overflow-hidden border-b border-gray-600 bg-gray-700">

        {/* Background Effects */}
        <div className="pointer-events-none absolute -right-52 -top-52 hidden h-[600px] w-[600px] rounded-full bg-black/10 blur-3xl md:block" />

        <div className="pointer-events-none absolute -bottom-60 -left-52 hidden h-[600px] w-[600px] rounded-full bg-white/[0.06] blur-3xl md:block" />

        <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">

          <div className="grid grid-cols-1 items-center gap-10 py-12 sm:gap-14 sm:py-16 lg:min-h-[680px] lg:grid-cols-2 lg:gap-32 lg:py-24">

            {/* ================= HERO CONTENT ================= */}
            <div className="py-8 lg:py-12">

              <p className="mb-6 text-xs font-bold tracking-[0.25em] text-gray-200 sm:text-sm">
                MULTI-VENDOR ELECTRONICS MARKETPLACE
              </p>

              <h1 className="text-5xl font-black leading-[0.98] tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl xl:text-[80px]">
                Everything
                <br />
                <span className="text-gray-300">
                  Electronics.
                </span>
              </h1>

              <h2 className="mt-4 text-4xl font-extrabold leading-[1.02] tracking-[-0.03em] text-gray-100 sm:text-5xl lg:text-6xl xl:text-7xl">
                All In One Place.
              </h2>

              <p className="mt-8 max-w-xl text-base leading-7 text-gray-200 sm:text-lg">
                Discover smartphones, laptops, gaming devices,
                accessories and electronics from trusted vendors.
              </p>


              {/* ================= HERO BUTTONS ================= */}
              <div className="mt-14 flex flex-wrap gap-6">

                <Link
                  to="/products"
                  className="group inline-flex min-h-[54px] items-center justify-center gap-3 rounded-xl bg-black px-9 py-4 text-base font-bold text-white shadow-xl shadow-black/20 transition-all duration-300 hover:-translate-y-1 hover:bg-[#171717] hover:shadow-2xl active:translate-y-0"
                >
                  <span>Shop Now</span>

                  <span className="text-lg transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </Link>


                <Link
                  to="/vendor"
                  className="inline-flex min-h-[54px] items-center justify-center rounded-xl border border-white/60 bg-white/10 px-9 py-4 text-base font-bold text-white backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-white hover:bg-white hover:text-black hover:shadow-xl active:translate-y-0"
                >
                  Become a Seller
                </Link>

              </div>


              {/* ================= STATS ================= */}
              <div className="mt-20 grid max-w-xl grid-cols-3 gap-10 border-t border-white/30 pt-10 sm:gap-14">

                <div>
                  <h3 className="text-2xl font-black text-white sm:text-3xl">
                    500+
                  </h3>

                  <p className="mt-2 text-xs font-medium text-gray-200 sm:text-sm">
                    Products
                  </p>
                </div>

                <div>
                  <h3 className="text-2xl font-black text-white sm:text-3xl">
                    50+
                  </h3>

                  <p className="mt-2 text-xs font-medium text-gray-200 sm:text-sm">
                    Vendors
                  </p>
                </div>

                <div>
                  <h3 className="text-2xl font-black text-white sm:text-3xl">
                    1000+
                  </h3>

                  <p className="mt-2 text-xs font-medium text-gray-200 sm:text-sm">
                    Customers
                  </p>
                </div>

              </div>

            </div>


            {/* =====================================================
                HERO PRODUCT CARD
            ===================================================== */}
            <div className="flex justify-center py-12 lg:justify-end lg:py-16">

              <div
                className="group w-full max-w-lg rounded-[32px] border border-white/20 bg-[#202020] p-7 shadow-2xl shadow-black/30 transition-all duration-500 ease-out hover:-translate-y-3 hover:border-white/40 hover:bg-[#242424] sm:p-9"
              >

                {/* Product Image */}
                <div className="relative flex h-[320px] items-center justify-center overflow-hidden rounded-[25px] border border-white/10 bg-[#111111] p-8 sm:h-[390px] sm:p-10">

                  {/* Image Glow */}
                  <div className="pointer-events-none absolute h-64 w-64 rounded-full bg-white/[0.06] blur-3xl" />

                  <img
                    src={latestelectronics}
                    alt="Latest Electronics"
                    className="relative h-full w-full object-contain transition-transform duration-700 ease-out group-hover:scale-110"
                  />

                </div>


                {/* Product Content */}
                <div className="px-2 pb-3 pt-10 text-center">

                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-gray-400">
                    Featured Collection
                  </p>

                  <h2 className="mt-4 text-2xl font-extrabold text-white sm:text-3xl">
                    Latest Electronics
                  </h2>

                  <p className="mt-4 text-sm text-gray-300 sm:text-base">
                    Products from trusted sellers
                  </p>

                  <Link
                    to="/products"
                    className="mt-9 inline-flex min-h-[52px] items-center justify-center gap-3 rounded-xl bg-white px-9 py-3.5 font-bold text-black shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-gray-200 hover:shadow-2xl"
                  >
                    Explore Products

                    <span className="transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </Link>

                </div>

              </div>

            </div>

          </div>
        </div>
      </section>


      {/* =========================================================
          CATEGORY SECTION
      ========================================================= */}
      <section className="bg-gray-700">

        <div className="mx-auto max-w-7xl px-5 py-28 sm:px-8 sm:py-32 lg:px-10">

          {/* Heading */}
          <div className="mb-20 flex items-end justify-between gap-10">

            <div>

              <p className="text-xs font-bold tracking-[0.22em] text-gray-200 sm:text-sm">
                SHOP BY CATEGORY
              </p>

              <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
                Explore Electronics
              </h2>

              <p className="mt-4 max-w-xl text-sm text-gray-200 sm:text-base">
                Find the products you need from different vendors.
              </p>

            </div>

            <Link
              to="/categories"
              className="hidden min-h-[48px] items-center gap-3 rounded-xl border border-white/40 bg-white/10 px-6 py-3 font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:text-black md:flex"
            >
              View All
              <span>→</span>
            </Link>

          </div>


          {/* =====================================================
              CATEGORY CARDS
          ===================================================== */}
         <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 lg:gap-x-10 lg:gap-y-14">

            {categories.map((category) => (

              <Link
                to="/products"
                key={category.name}
                className="group overflow-hidden rounded-[24px] border border-white/15 bg-[#202020] shadow-xl shadow-black/20 transition-all duration-500 ease-out hover:-translate-y-3 hover:border-white/35 hover:bg-[#272727] hover:shadow-2xl hover:shadow-black/40"
              >

                {/* Image Area */}
                <div className="relative flex h-44 items-center justify-center overflow-hidden border-b border-white/10 bg-[#141414] p-7">

                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.07] via-transparent to-transparent" />

                  <div className="pointer-events-none absolute h-28 w-28 rounded-full bg-white/[0.05] blur-2xl" />

                  <img
                    src={category.image}
                    alt={category.name}
                    loading="lazy"
                    decoding="async"
                    className="relative h-full w-full object-contain transition-transform duration-500 ease-out group-hover:scale-110"
                  />

                </div>


                {/* Card Content */}
                <div className="p-7 text-center">

                  <h3 className="text-base font-bold text-white transition-colors duration-300 group-hover:text-gray-200">
                    {category.name}
                  </h3>

                  <p className="mt-3 text-xs text-gray-400">
                    Explore {category.name}
                  </p>

                </div>

              </Link>

            ))}

          </div>

        </div>
      </section>


      {/* =========================================================
          FEATURES SECTION
      ========================================================= */}
      <section className="border-y border-gray-600 bg-[#1b1b1b]">

        <div className="mx-auto max-w-7xl px-5 py-28 sm:px-8 sm:py-32 lg:px-10">

          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">

            {/* Feature 1 */}
            <div className="group rounded-[24px] border border-white/10 bg-[#242424] p-10 text-center shadow-xl transition-all duration-500 hover:-translate-y-2 hover:border-white/25 hover:bg-[#292929]">

              <div className="mb-6 text-3xl transition-transform duration-300 group-hover:scale-110">
                🚚
              </div>

              <h3 className="text-lg font-bold text-white">
                Fast Delivery
              </h3>

              <p className="mt-4 text-sm leading-6 text-gray-400">
                Get your electronics delivered quickly.
              </p>

            </div>


            {/* Feature 2 */}
            <div className="group rounded-[24px] border border-white/10 bg-[#242424] p-10 text-center shadow-xl transition-all duration-500 hover:-translate-y-2 hover:border-white/25 hover:bg-[#292929]">

              <div className="mb-6 text-3xl transition-transform duration-300 group-hover:scale-110">
                🔒
              </div>

              <h3 className="text-lg font-bold text-white">
                Secure Shopping
              </h3>

              <p className="mt-4 text-sm leading-6 text-gray-400">
                Your shopping experience is safe and secure.
              </p>

            </div>


            {/* Feature 3 */}
            <div className="group rounded-[24px] border border-white/10 bg-[#242424] p-10 text-center shadow-xl transition-all duration-500 hover:-translate-y-2 hover:border-white/25 hover:bg-[#292929]">

              <div className="mb-6 text-3xl transition-transform duration-300 group-hover:scale-110">
                🏪
              </div>

              <h3 className="text-lg font-bold text-white">
                Trusted Vendors
              </h3>

              <p className="mt-4 text-sm leading-6 text-gray-400">
                Shop from multiple trusted electronics vendors.
              </p>

            </div>


            {/* Feature 4 */}
            <div className="group rounded-[24px] border border-white/10 bg-[#242424] p-10 text-center shadow-xl transition-all duration-500 hover:-translate-y-2 hover:border-white/25 hover:bg-[#292929]">

              <div className="mb-6 text-3xl transition-transform duration-300 group-hover:scale-110">
                💬
              </div>

              <h3 className="text-lg font-bold text-white">
                Customer Support
              </h3>

              <p className="mt-4 text-sm leading-6 text-gray-400">
                We are here to help whenever you need us.
              </p>

            </div>

          </div>

        </div>
      </section>


      {/* =========================================================
          VENDOR CTA SECTION
      ========================================================= */}
      <section className="border-t border-gray-600 bg-gray-700">

        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10">

          <div className="relative flex flex-col items-center justify-between gap-8 overflow-hidden  border border-white/15 bg-[#202020] p-9 shadow-2xl sm:p-12 lg:flex-row lg:p-14">

            {/* Background Glow */}
            <div className="pointer-events-none absolute -right-28 -top-28 h-72 w-72 rounded-full bg-white/[0.05] blur-3xl" />

            <div className="relative text-center text-white lg:text-left">

              <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-gray-400">
                SELL WITH US
              </p>

              <h2 className="text-2xl font-black sm:text-3xl lg:text-4xl">
                Want to sell your electronics?
              </h2>

              <p className="mt-3 text-sm text-gray-300 sm:text-base">
                Join our marketplace and start selling today.
              </p>

            </div>


            <Link
              to="/vendor"
              className="relative inline-flex min-h-[54px] items-center justify-center whitespace-nowrap rounded-xl bg-white px-10 py-4 font-bold text-black shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-gray-200 hover:shadow-2xl active:translate-y-0"
            >
              Become a Vendor →
            </Link>

          </div>

        </div>
      </section>

    </div>
  );
}

export default Home;
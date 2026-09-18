import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useCartStore from "../store/cartstore";

const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

function Deals() {
  const addToCart = useCartStore((state) => state.addToCart);

  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/deals");

        if (!response.ok) {
          throw new Error("Could not load deals");
        }

        const data = await response.json();
        setDeals(data);
      } catch (err) {
        setError(
          "Could not connect to the deals server. Please keep the backend terminal running."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, []);

  const handleAddToCart = (deal) => {
    if (deal.stock <= 0 || deal.saleStatus !== "active") return;

    addToCart({
      ...deal,
      isOnSale: true,
      oldPrice: deal.originalPrice,
    });

    alert(`${deal.name} added to cart at the sale price!`);
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-gray-100">
        <p className="text-lg font-semibold text-gray-600">
          Loading deals...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-gray-100 px-4">
        <div className="rounded-2xl bg-white p-8 text-center shadow-md border border-gray-200">
          <h1 className="text-2xl font-bold text-gray-800">
            Unable to Load Deals
          </h1>

          <p className="mt-3 text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 text-center">
          <p className="inline-block rounded-full bg-gray-200 px-4 py-1 text-sm font-bold text-gray-700">
            LIMITED-TIME OFFERS
          </p>

          <h1 className="mt-3 text-4xl font-bold text-gray-800">
            Today&apos;s Deals
          </h1>

          <p className="mt-3 text-lg text-gray-500">
            Save 50% on selected electronics.
          </p>
        </div>

        {deals.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow-md border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800">
              No Deals Available
            </h2>

            <p className="mt-2 text-gray-500">
              Please check again later for new sale offers.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {deals.map((deal) => {
              const isEnded = deal.saleStatus === "ended";
              const isUpcoming = deal.saleStatus === "upcoming";

              const canAddToCart =
                deal.stock > 0 && deal.saleStatus === "active";

              return (
                <div
                  key={deal.id}
                  className={`overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-200 transition duration-300 hover:shadow-lg ${
                    isEnded ? "opacity-70" : ""
                  }`}
                >
                  <div className="relative flex h-64 items-center justify-center bg-gray-100 p-5">
                    <span className="absolute left-3 top-3 z-10 rounded-full bg-gray-800 px-3 py-1 text-sm font-bold text-white">
                      {deal.discountPercent}% OFF
                    </span>

                    <span className="absolute right-3 top-3 z-10 rounded-full bg-gray-700 px-3 py-1 text-xs font-bold text-white">
                      {deal.saleName}
                    </span>

                    <img
                      src={deal.image}
                      alt={deal.name}
                      className="h-full w-full object-contain"
                    />
                  </div>

                  <div className="p-5">
                    <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                      {deal.category}
                    </p>

                    <h2 className="mt-2 text-xl font-bold text-gray-800">
                      {deal.name}
                    </h2>

                    <p className="mt-2 text-sm text-gray-500">
                      Sold by{" "}
                      <span className="font-semibold text-gray-700">
                        {deal.vendor}
                      </span>
                    </p>

                    <div className="mt-3 flex items-center gap-3">
                      <span className="text-2xl font-bold text-gray-800">
                        ${Number(deal.price).toFixed(2)}
                      </span>

                      <span className="text-sm text-gray-400 line-through">
                        ${Number(deal.originalPrice).toFixed(2)}
                      </span>
                    </div>

                    <p className="mt-1 text-sm font-semibold text-gray-600">
                      You save $
                      {(
                        Number(deal.originalPrice) -
                        Number(deal.price)
                      ).toFixed(2)}
                    </p>

                    <div className="mt-4 border-t border-gray-200 pt-3 text-sm">
                      <p className="text-gray-600">
                        Starts:{" "}
                        <span className="font-semibold text-gray-800">
                          {formatDate(deal.startDate)}
                        </span>
                      </p>

                      <p className="mt-1 text-gray-600">
                        Ends:{" "}
                        <span className="font-semibold text-gray-800">
                          {formatDate(deal.endDate)}
                        </span>
                      </p>
                    </div>

                    {isEnded && (
                      <p className="mt-3 text-center font-bold text-gray-500">
                        Sale Ended
                      </p>
                    )}

                    {isUpcoming && (
                      <p className="mt-3 text-center font-bold text-gray-500">
                        Sale Starts Soon
                      </p>
                    )}

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <Link
                        to={`/products/${deal.id}`}
                        className="flex items-center justify-center rounded-xl border border-gray-400 px-3 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
                      >
                        Details
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleAddToCart(deal)}
                        disabled={!canAddToCart}
                        className={`rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                          canAddToCart
                            ? "bg-gray-800 text-white hover:bg-gray-900"
                            : "cursor-not-allowed bg-gray-200 text-gray-400"
                        }`}
                      >
                        {isEnded
                          ? "Offer Expired"
                          : isUpcoming
                          ? "Coming Soon"
                          : deal.stock <= 0
                          ? "Unavailable"
                          : "Add to Cart"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-10 text-center">
          <Link
            to="/products"
            className="inline-block rounded-lg bg-gray-900 px-6 py-3 font-semibold text-white transition hover:bg-gray-700"
          >
            View All Products
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Deals;
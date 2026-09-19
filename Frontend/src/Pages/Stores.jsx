import { Link } from "react-router-dom";

function Stores() {
  const stores = [
    {
      id: 1,
      name: "Tech World",
      category: "Smartphones & Accessories",
      location: "Islamabad",
      products: 45,
      rating: 4.8,
      image: "https://images.unsplash.com/photo-1531297484001-80022131f5a1",
    },
    {
      id: 2,
      name: "Laptop Zone",
      category: "Laptops & Computers",
      location: "Lahore",
      products: 32,
      rating: 4.7,
      image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853",
    },
    {
      id: 3,
      name: "Mobile Hub",
      category: "Mobile Phones",
      location: "Karachi",
      products: 58,
      rating: 4.9,
      image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9",
    },
    {
      id: 4,
      name: "Smart Gadgets",
      category: "Smart Watches & Gadgets",
      location: "Rawalpindi",
      products: 27,
      rating: 4.6,
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
    },
    {
      id: 5,
      name: "Gaming World",
      category: "Gaming Products",
      location: "Faisalabad",
      products: 39,
      rating: 4.8,
      image: "https://images.unsplash.com/photo-1593305841991-05c297ba4575",
    },
    {
      id: 6,
      name: "Camera House",
      category: "Cameras & Photography",
      location: "Multan",
      products: 21,
      rating: 4.5,
      image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-6">

        {/* Heading */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800">
            Explore Our Stores
          </h1>

          <p className="mt-3 text-gray-500">
            Shop from trusted vendors across our electronics marketplace.
          </p>
        </div>

        {/* Store Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">

          {stores.map((store) => (
            <div
              key={store.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition"
            >

              {/* Store Image */}
              <img
                src={`${store.image}${store.image.includes("?") ? "" : "?auto=format&fit=crop&w=800&q=75"}`}
                alt={store.name}
                loading="lazy"
                decoding="async"
                className="w-full h-48 object-cover"
              />

              {/* Store Information */}
              <div className="p-6">

                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      {store.name}
                    </h2>

                    <p className="text-gray-500 mt-1">
                      {store.category}
                    </p>
                  </div>

                  <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm font-semibold">
                    ⭐ {store.rating}
                  </span>
                </div>

                <div className="mt-4 text-sm text-gray-600">
                  📍 {store.location}
                </div>

                <div className="mt-2 text-sm text-gray-600">
                  🛍️ {store.products} Products
                </div>

                {/* Visit Store */}
                <Link
                  to={`/store/${store.id}`}
                  className="block text-center mt-6 bg-gray-800 text-white py-3 rounded-lg font-semibold hover:bg-gray-900 transition"
                >
                  Visit Store
                </Link>

              </div>
            </div>
          ))}

        </div>
      </div>
    </div>
  );
}

export default Stores;
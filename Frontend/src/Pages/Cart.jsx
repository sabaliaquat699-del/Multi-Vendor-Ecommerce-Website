import { Link } from "react-router-dom";
import useCartStore from "../store/cartstore";

function Cart() {
  const {
    cart,
    removeFromCart,
    decreaseQuantity,
    addToCart,
    clearCart,
  } = useCartStore();

  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const shipping = subtotal > 0 ? 10 : 0;
  const total = subtotal + shipping;

  if (cart.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-16">
        <div className="mx-auto w-full max-w-md rounded-2xl bg-white p-12 text-center shadow-md border border-gray-200">
          <div className="mb-5 text-6xl">🛒</div>

          <h1 className="mb-3 text-3xl font-bold text-gray-800">
            Your Cart is Empty
          </h1>

          <p className="mb-8 text-gray-500">
            Add some electronics to your cart and they will appear here.
          </p>

          <Link
            to="/products"
            className="inline-block rounded-lg bg-gray-800 px-7 py-3 font-semibold text-white transition hover:bg-gray-900"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">
              Shopping Cart
            </h1>

            <p className="mt-2 text-gray-500">
              {cart.length} product{cart.length !== 1 ? "s" : ""} in your cart
            </p>
          </div>

          <button
            onClick={clearCart}
            className="rounded-lg border border-gray-400 px-4 py-2 font-semibold text-gray-600 transition hover:bg-gray-700 hover:text-white hover:border-gray-700"
          >
            Clear Cart
          </button>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">

          <div className="space-y-5 lg:col-span-2">

            {cart.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-5 rounded-2xl bg-white p-5 shadow-sm border border-gray-200 sm:flex-row sm:items-center"
              >

                <div className="flex h-32 w-full items-center justify-center rounded-xl bg-gray-100 sm:w-32">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full rounded-xl object-contain p-3"
                  />
                </div>

                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-800">
                    {item.name}
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    {item.category}
                  </p>

                  <p className="mt-3 text-xl font-bold text-gray-700">
                    ${item.price.toFixed(2)}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => decreaseQuantity(item.id)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 text-xl font-bold text-gray-700 hover:bg-gray-100"
                  >
                    −
                  </button>

                  <span className="w-8 text-center text-lg font-bold text-gray-800">
                    {item.quantity}
                  </span>

                  <button
                    onClick={() => addToCart(item)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-800 text-xl font-bold text-white hover:bg-gray-900"
                  >
                    +
                  </button>
                </div>

                <div className="text-right">
                  <p className="font-bold text-gray-800">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="mt-2 text-sm font-semibold text-gray-500 hover:text-gray-800"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="h-fit rounded-2xl bg-white p-6 shadow-sm border border-gray-200">
            <h2 className="mb-6 text-2xl font-bold text-gray-800">
              Order Summary
            </h2>

            <div className="space-y-4 border-b border-gray-200 pb-5">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>${shipping.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-between py-5 text-xl font-bold text-gray-800">
              <span>Total</span>
              <span className="text-gray-900">
                ${total.toFixed(2)}
              </span>
            </div>

            <Link
              to="/checkout"
              className="block w-full rounded-lg bg-gray-800 py-3 text-center font-bold text-white transition hover:bg-gray-900"
            >
              Proceed to Checkout
            </Link>

            <Link
              to="/products"
              className="mt-3 block w-full rounded-lg border border-gray-300 py-3 text-center font-semibold text-gray-700 transition hover:bg-gray-100"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;
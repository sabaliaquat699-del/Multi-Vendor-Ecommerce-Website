import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";
import ProtectedRoute from "./Components/ProtectedRoute";

// Home loads immediately (landing page).
import Home from "./Pages/Home";

// Every other page is loaded only when the user opens it
// (smaller first download = faster on mobile).
const Products = lazy(() => import("./Pages/Products"));
const ProductDetails = lazy(() => import("./Pages/ProductDetails"));
const Categories = lazy(() => import("./Pages/Categories"));
const Stores = lazy(() => import("./Pages/Stores"));
const Cart = lazy(() => import("./Pages/Cart"));
const Checkout = lazy(() => import("./Pages/Checkout"));
const OrderSuccess = lazy(() => import("./Pages/OrderSuccess"));
const Login = lazy(() => import("./Pages/Login"));
const Register = lazy(() => import("./Pages/Register"));
const VerifyEmail = lazy(() => import("./Pages/VerifyEmail"));
const VendorDashboard = lazy(() => import("./Pages/VendorDashboard"));
const AdminDashboard = lazy(() => import("./Pages/AdminDashboard"));
const Deals = lazy(() => import("./Pages/Deals"));
const NotFound = lazy(() => import("./Pages/NotFound"));
const ForgotPassword = lazy(() => import("./Pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./Pages/ResetPassword"));

function PageLoader() {
  return (
    <div
      className="flex min-h-[60vh] items-center justify-center px-6 text-gray-500"
      role="status"
      aria-live="polite"
    >
      Loading...
    </div>
  );
}

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">

      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1">
        <Suspense fallback={<PageLoader />}>
          <Routes>

            {/* Home */}
            <Route
              path="/"
              element={<Home />}
            />

            {/* Products */}
            <Route
              path="/products"
              element={<Products />}
            />

            {/* Product Details */}
            <Route
              path="/products/:id"
              element={<ProductDetails />}
            />

            {/* Categories */}
            <Route
              path="/categories"
              element={<Categories />}
            />

            {/* Stores */}
            <Route
              path="/stores"
              element={<Stores />}
            />

            {/* Deals */}
            <Route
              path="/deals"
              element={<Deals />}
            />

            {/* Cart */}
            <Route
              path="/cart"
              element={<Cart />}
            />

            {/* Checkout */}
            <Route
              path="/checkout"
              element={<Checkout />}
            />

            {/* Order Success */}
            <Route
              path="/order-success"
              element={<OrderSuccess />}
            />

            {/* Login */}
            <Route
              path="/login"
              element={<Login />}
            />

            {/* Register */}
            <Route
              path="/register"
              element={<Register />}
            />

            {/* Email Verification */}
            <Route
              path="/verify-email/:token"
              element={<VerifyEmail />}
            />

            {/* Forgot Password */}
            <Route
              path="/forgot-password"
              element={<ForgotPassword />}
            />

            {/* Reset Password */}
            <Route
              path="/reset-password/:token"
              element={<ResetPassword />}
            />

            {/* Vendor */}
            <Route
              path="/vendor"
              element={
                <ProtectedRoute role="vendor">
                  <VendorDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/vendor/dashboard"
              element={
                <ProtectedRoute role="vendor">
                  <VendorDashboard />
                </ProtectedRoute>
              }
            />

            {/* Admin */}
            <Route
              path="/admin"
              element={<AdminDashboard />}
            />

            <Route
              path="/admin/dashboard"
              element={<AdminDashboard />}
            />

            {/* 404 */}
            <Route
              path="*"
              element={<NotFound />}
            />

          </Routes>
        </Suspense>
      </main>

      {/* Footer */}
      <Footer />

    </div>
  );
}

export default App;
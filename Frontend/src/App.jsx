import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";
import ProtectedRoute from "./Components/ProtectedRoute";

import Home from "./Pages/Home";

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
const AdminVendors = lazy(() => import("./Pages/AdminVendors"));
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

      <Navbar />

      <main className="flex-1">
        <Suspense fallback={<PageLoader />}>
          <Routes>

            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetails />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/stores" element={<Stores />} />
            <Route path="/deals" element={<Deals />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-success" element={<OrderSuccess />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email/:token" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

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

            {/* Admin — now protected, only role === "admin" can enter */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute role="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute role="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/vendors"
              element={
                <ProtectedRoute role="admin">
                  <AdminVendors />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFound />} />

          </Routes>
        </Suspense>
      </main>

      <Footer />

    </div>
  );
}

export default App;
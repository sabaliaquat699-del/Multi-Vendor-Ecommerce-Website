import { Routes, Route } from "react-router-dom";
import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";

import Home from "./Pages/Home";
import Products from "./Pages/Products";
import ProductDetails from "./Pages/ProductDetails";
import Categories from "./Pages/Categories";
import Stores from "./Pages/Stores";
import Cart from "./Pages/Cart";
import Checkout from "./Pages/Checkout";
import OrderSuccess from "./Pages/OrderSuccess";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import VendorDashboard from "./Pages/VendorDashboard";
import AdminDashboard from "./Pages/AdminDashboard";
import Deals from "./Pages/Deals";
import NotFound from "./Pages/NotFound";
import ForgotPassword from "./Pages/ForgotPassword";
import ResetPassword from "./Pages/ResetPassword";

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">

      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1">
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
            element={<VendorDashboard />}
          />

          <Route
            path="/vendor/dashboard"
            element={<VendorDashboard />}
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
      </main>

      {/* Footer */}
      <Footer />

    </div>
  );
}

export default App;
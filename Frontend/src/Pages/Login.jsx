import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { API_URL } from "../config";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError("Please enter email and password.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Login failed");
      }

      login(data.user, data.token);

      if (data.user.role === "vendor") {
        navigate("/vendor");
      } else if (data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(
        err.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#f7f7f7] flex items-center justify-center px-4 py-16 sm:px-6 lg:px-8">

      <div className="w-full max-w-[460px]">

        {/* Heading */}
        <div className="text-center mb-8">

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#171717]">
            Welcome Back
          </h1>

          <p className="mt-3 text-sm sm:text-base text-gray-500">
            Login to your ElectroMarket account
          </p>

        </div>

        {/* Login Card */}
        <div className="w-full rounded-2xl border border-gray-200 bg-white px-6 py-7 shadow-[0_10px_35px_rgba(0,0,0,0.07)] sm:px-8 sm:py-8">

          {/* Error */}
          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* Email */}
            <div className="mb-5">

              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-[#171717]"
              >
                Email Address
              </label>

              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) {
                    setError("");
                  }
                }}
                autoComplete="email"
                style={{
                  width: "100%",
                  height: "48px",
                  padding: "0 14px",
                  boxSizing: "border-box",
                }}
                className="rounded-lg border border-gray-300 bg-white text-sm text-gray-900 outline-none transition-all duration-200 placeholder:text-gray-400 hover:border-gray-400 focus:border-[#171717] focus:ring-2 focus:ring-gray-200"
              />

            </div>

            {/* Password */}
            <div className="mb-6">

              <div className="mb-2 flex items-center justify-between">

                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-[#171717]"
                >
                  Password
                </label>

                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-gray-500 transition hover:text-[#171717]"
                >
                  Forgot password?
                </Link>

              </div>

              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) {
                    setError("");
                  }
                }}
                autoComplete="current-password"
                style={{
                  width: "100%",
                  height: "48px",
                  padding: "0 14px",
                  boxSizing: "border-box",
                }}
                className="rounded-lg border border-gray-300 bg-white text-sm text-gray-900 outline-none transition-all duration-200 placeholder:text-gray-400 hover:border-gray-400 focus:border-[#171717] focus:ring-2 focus:ring-gray-200"
              />

            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className={`flex h-12 w-full items-center justify-center gap-2 rounded-lg text-sm font-semibold text-white transition-all duration-200 ${
                loading
                  ? "cursor-not-allowed bg-gray-400"
                  : "bg-[#171717] hover:bg-black active:scale-[0.99]"
              }`}
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <span>Login</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>

          </form>

          {/* Divider */}
          <div className="my-7 flex items-center gap-4">

            <div className="h-px flex-1 bg-gray-200"></div>

            <span className="text-xs font-medium text-gray-400">
              OR
            </span>

            <div className="h-px flex-1 bg-gray-200"></div>

          </div>

          {/* Register */}
          <div className="text-center">

            <p className="text-sm text-gray-500">
              Don't have an account?
            </p>

            <Link
              to="/register"
              className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-[#171717] transition hover:underline hover:underline-offset-4"
            >
              Create an account
              <ArrowRight size={15} />
            </Link>

          </div>

        </div>

        {/* Bottom Text */}
        <p className="mt-6 text-center text-xs text-gray-400">
          Secure access to your ElectroMarket account
        </p>

      </div>

    </div>
  );
}

export default Login;
import { API_URL } from "../config";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 30);

    return () => clearTimeout(timer);
  }, []);

  const inputClass =
    "w-full h-12 px-4 border border-gray-300 rounded-xl outline-none text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all duration-200";

  const labelClass =
    "block text-sm font-semibold text-gray-700 mb-1.5";

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/auth/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Something went wrong."
        );
      }

      setSubmitted(true);
    } catch (err) {
      setError(
        err.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gray-50 px-6 py-12">
      <div
        className={`w-full max-w-md transition-all duration-500 ease-out ${
          mounted
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4"
        }`}
      >
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm transition-shadow duration-300 hover:shadow-md">

          {!submitted ? (
            <>
              <h2 className="text-2xl font-bold text-gray-900">
                Forgot your password?
              </h2>

              <p className="text-gray-500 mt-2 text-sm">
                Enter the email associated with your account and
                we'll send you a link to reset your password.
              </p>

              <div
                className={`grid transition-all duration-300 ease-out ${
                  error
                    ? "grid-rows-[1fr] opacity-100 mt-5"
                    : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
                    {error}
                  </div>
                </div>
              </div>

              <form
                onSubmit={handleSubmit}
                className="mt-6 space-y-4"
              >
                <div>
                  <label className={labelClass}>
                    Email Address
                  </label>

                  <div className="relative">
                    <Mail
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);

                        if (error) {
                          setError("");
                        }
                      }}
                      className={inputClass + " pl-11"}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full h-12 rounded-xl font-bold text-white transition-all duration-200 active:scale-[0.98] ${
                    loading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-[#171717] hover:bg-black"
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                      Sending...
                    </span>
                  ) : (
                    "Send Reset Link"
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4 animate-[fadeIn_0.4s_ease-out]">
              <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4 transition-transform duration-300 scale-100">
                <CheckCircle
                  size={28}
                  className="text-green-600"
                />
              </div>

              <h2 className="text-xl font-bold text-gray-900">
                Check your email
              </h2>

              <p className="text-gray-500 mt-2 text-sm">
                If an account exists for{" "}
                <strong>{email}</strong>, a password reset link
                has been sent. The link expires in 15 minutes.
              </p>
            </div>
          )}

          <Link
            to="/login"
            className="flex items-center justify-center gap-2 mt-6 text-sm text-gray-500 hover:text-gray-900 transition-colors duration-200"
          >
            <ArrowLeft size={14} />
            Back to sign in
          </Link>

        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
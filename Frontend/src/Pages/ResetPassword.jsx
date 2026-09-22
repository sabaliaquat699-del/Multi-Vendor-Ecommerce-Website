import { API_URL } from "../config";
import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Eye,
  EyeOff,
  CheckCircle,
} from "lucide-react";

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

function ResetPassword() {
  const navigate = useNavigate();

  const { token } = useParams();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(
      () => setMounted(true),
      30
    );

    return () => clearTimeout(timer);
  }, []);

  const inputClass =
    "w-full h-12 px-4 border border-gray-300 rounded-xl outline-none text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all duration-200";

  const labelClass =
    "block text-sm font-semibold text-gray-700 mb-1.5";

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!PASSWORD_REGEX.test(password)) {
      setError(
        "Password must be at least 8 characters and include an uppercase letter, a lowercase letter, and a number."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/auth/reset-password/${token}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            password,
            confirmPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to reset password."
        );
      }

      setSuccess(true);

      setTimeout(
        () => navigate("/login"),
        2500
      );
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

          {!success ? (
            <>
              <h2 className="text-2xl font-bold text-gray-900">
                Set a new password
              </h2>

              <p className="text-gray-500 mt-2 text-sm">
                Choose a strong password you haven't used
                before.
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
                    New Password
                  </label>

                  <div className="relative">
                    <input
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      placeholder="********"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);

                        if (error) {
                          setError("");
                        }
                      }}
                      className={
                        inputClass + " pr-11"
                      }
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          !showPassword
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors duration-200"
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>
                    Confirm New Password
                  </label>

                  <div className="relative">
                    <input
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      placeholder="********"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(
                          e.target.value
                        );

                        if (error) {
                          setError("");
                        }
                      }}
                      className={
                        inputClass + " pr-11"
                      }
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          !showConfirmPassword
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors duration-200"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
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
                      Resetting...
                    </span>
                  ) : (
                    "Reset Password"
                  )}
                </button>

              </form>
            </>
          ) : (
            <div className="text-center py-4 animate-[fadeIn_0.4s_ease-out]">

              <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                <CheckCircle
                  size={28}
                  className="text-green-600"
                />
              </div>

              <h2 className="text-xl font-bold text-gray-900">
                Password reset successful
              </h2>

              <p className="text-gray-500 mt-2 text-sm">
                Redirecting you to sign in...
              </p>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
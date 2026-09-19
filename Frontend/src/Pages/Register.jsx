import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { Eye, EyeOff, User, Store, Zap, Upload, X, MailCheck } from "lucide-react";
import { API_URL } from "../config";

function Register() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  // "Become a Seller" links here as /register?role=vendor,
  // so the Vendor tab should already be selected.
  const [role, setRole] = useState(
    searchParams.get("role") === "vendor" ? "vendor" : "customer"
  );

  useEffect(() => {
    if (searchParams.get("role") === "vendor") {
      setRole("vendor");
    }
  }, [searchParams]);

  // Already logged in as a vendor? No need to register again.
  useEffect(() => {
    if (user?.role === "vendor") {
      navigate("/vendor", { replace: true });
    }
  }, [user, navigate]);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");

  const [storeName, setStoreName] = useState("");
  const [storeDescription, setStoreDescription] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");

  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Shown after a successful register call, instead of
  // auto-logging in (account is inactive until verified).
  const [registered, setRegistered] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setError("Please upload a valid image (JPEG, PNG, WEBP, or GIF).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5MB.");
      return;
    }

    setError("");
    setProfileImage(file);
    setProfileImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
    setProfileImagePreview("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!firstName.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (role === "vendor" && !storeName.trim()) {
      setError("Store name is required for vendor accounts.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const formData = new FormData();
      formData.append("firstName", firstName.trim());
      formData.append("lastName", lastName.trim());
      formData.append("email", email.trim());
      formData.append("phone", phone.trim());
      formData.append("password", password);
      formData.append("role", role);
      formData.append("address", address.trim());
      formData.append("city", city.trim());
      formData.append("country", country.trim());

      if (role === "vendor") {
        formData.append("storeName", storeName.trim());
        formData.append("storeDescription", storeDescription.trim());
        formData.append("businessName", businessName.trim());
        formData.append("businessAddress", businessAddress.trim());
      }

      if (profileImage) {
        formData.append("profileImage", profileImage);
      }

      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Registration failed");
      }

      // Account created but NOT active yet — it needs email
      // verification before the user can log in. Show a
      // confirmation screen instead of auto-logging in.
      setRegisteredEmail(email.trim());
      setRegistered(true);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setResendLoading(true);
      setResendMessage("");

      const response = await fetch(`${API_URL}/api/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: registeredEmail }),
      });

      const data = await response.json();
      setResendMessage(
        data.message || "A new verification link has been sent."
      );
    } catch {
      setResendMessage("Something went wrong. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  const inputClass =
    "w-full h-12 px-4 border border-gray-300 rounded-xl outline-none text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition";

  const labelClass = "block text-sm font-semibold text-gray-700 mb-1.5";

  // ------------------------------------------------------
  // "Check your email" confirmation screen — shown right
  // after a successful register() call.
  // ------------------------------------------------------
  if (registered) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6 py-14">
        <div className="w-full max-w-md">
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm text-center">
            <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
              <MailCheck size={28} className="text-green-600" />
            </div>

            <h2 className="text-xl font-bold text-gray-900">
              Check your email
            </h2>

            <p className="text-gray-500 mt-2 text-sm">
              We've sent a verification link to{" "}
              <strong>{registeredEmail}</strong>. Please verify your account
              before logging in
              {role === "vendor"
                ? " — your vendor account will also need admin approval before you can start selling."
                : "."}
            </p>

            <button
              type="button"
              onClick={handleResend}
              disabled={resendLoading}
              className="mt-5 text-sm font-semibold text-gray-900 underline underline-offset-2 disabled:opacity-60"
            >
              {resendLoading ? "Sending..." : "Didn't get it? Resend email"}
            </button>

            {resendMessage && (
              <p className="mt-2 text-xs text-gray-500">{resendMessage}</p>
            )}

            <Link
              to="/login"
              className="block mt-6 text-sm text-gray-500 hover:text-gray-900"
            >
              Back to login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-[#171717] text-white flex-col justify-between p-14 relative overflow-hidden">
        <div className="pointer-events-none absolute -right-40 -top-40 h-96 w-96 rounded-full bg-white/[0.05] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-white/[0.05] blur-3xl" />

        <div className="relative">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center">
              <Zap size={22} strokeWidth={2.5} className="text-black" />
            </div>
            <span className="text-2xl font-bold">NextTech</span>
          </Link>
        </div>

        <div className="relative">
          <h1 className="text-4xl font-black leading-tight tracking-tight">
            Join the marketplace
            <br />
            built for growth.
          </h1>

          <p className="mt-5 text-gray-300 max-w-md leading-7">
            Whether you are here to shop the latest electronics or grow your
            own store, create your account and get started in minutes.
          </p>

          <div className="mt-10 space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                <User size={18} />
              </div>
              <p className="text-gray-200 text-sm">
                Shop from hundreds of trusted vendors
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                <Store size={18} />
              </div>
              <p className="text-gray-200 text-sm">
                Open your own store and start selling
              </p>
            </div>
          </div>
        </div>

        <p className="relative text-xs text-gray-500">
          © 2026 NextTech. All rights reserved.
        </p>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-14 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-[#171717] flex items-center justify-center">
              <Zap size={18} strokeWidth={2.5} className="text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">NextTech</span>
          </div>

          <h2 className="text-3xl font-bold text-gray-900">Create your account</h2>
          <p className="text-gray-500 mt-2">
            Fill in your details to get started
          </p>

          <div className="grid grid-cols-2 gap-3 mt-7 p-1 bg-gray-100 rounded-xl">
            <button
              type="button"
              onClick={() => setRole("customer")}
              className={`flex items-center justify-center gap-2 h-11 rounded-lg text-sm font-semibold transition ${
                role === "customer"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <User size={16} />
              Customer
            </button>

            <button
              type="button"
              onClick={() => setRole("vendor")}
              className={`flex items-center justify-center gap-2 h-11 rounded-lg text-sm font-semibold transition ${
                role === "vendor"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Store size={16} />
              Vendor
            </button>
          </div>

          {error && (
            <div className="mt-5 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className={labelClass}>Profile Photo (optional)</label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center overflow-hidden shrink-0">
                  {profileImagePreview ? (
                    <img
                      src={profileImagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={24} className="text-gray-400" />
                  )}
                </div>

                <label
                  htmlFor="profileImageInput"
                  className="flex items-center gap-2 h-10 px-4 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 cursor-pointer transition"
                >
                  <Upload size={15} />
                  {profileImage ? "Change photo" : "Upload photo"}
                </label>
                <input
                  id="profileImageInput"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleImageChange}
                  className="hidden"
                />

                {profileImage && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="text-gray-400 hover:text-red-500 transition"
                    title="Remove photo"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>First Name</label>
                <input
                  type="text"
                  placeholder="Eshal"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Last Name</label>
                <input
                  type="text"
                  placeholder="Ariz"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Phone Number</label>
              <input
                type="text"
                placeholder="03xx-xxxxxxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputClass + " pr-11"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className={labelClass}>Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="********"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={inputClass + " pr-11"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className={labelClass}>Address (optional)</label>
              <input
                type="text"
                placeholder="House, street, area"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>City (optional)</label>
                <input
                  type="text"
                  placeholder="Rawalpindi"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Country (optional)</label>
                <input
                  type="text"
                  placeholder="Pakistan"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            {role === "vendor" && (
              <>
                <div className="pt-2 pb-1 border-t border-gray-200">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mt-4">
                    Business Information
                  </p>
                </div>

                <div>
                  <label className={labelClass}>Store Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Mobile World"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Store Description</label>
                  <textarea
                    placeholder="What does your store sell?"
                    value={storeDescription}
                    onChange={(e) => setStoreDescription(e.target.value)}
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition resize-none"
                  />
                </div>

                <div>
                  <label className={labelClass}>Business Name</label>
                  <input
                    type="text"
                    placeholder="Registered business name"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Business Address</label>
                  <input
                    type="text"
                    placeholder="Business location"
                    value={businessAddress}
                    onChange={(e) => setBusinessAddress(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full h-12 rounded-xl font-bold text-white transition flex items-center justify-center gap-2 ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#171717] hover:bg-black"
              }`}
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="text-center mt-7 text-sm text-gray-500">
            Already have an account?{" "}
            <Link to="/login" className="text-gray-900 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
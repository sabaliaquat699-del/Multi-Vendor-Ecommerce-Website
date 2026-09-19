import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { API_URL } from "../config";

function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const calledRef = useRef(false);

  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;

    const verify = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/auth/verify-email/${token}`,
          { method: "POST" }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Verification failed.");
        }

        // Backend already returns a fresh login token on
        // successful verification — log the user straight in.
        login(data.user, data.token);

        setStatus("success");
        setMessage(data.message || "Email verified successfully!");

        const redirectPath =
          data.user.role === "vendor"
            ? "/vendor"
            : data.user.role === "admin"
            ? "/admin"
            : "/";

        setTimeout(() => {
          navigate(redirectPath, { replace: true });
        }, 1800);
      } catch (err) {
        setStatus("error");
        setMessage(
          err.message ||
            "This verification link is invalid or has expired."
        );
      }
    };

    verify();
  }, [token, login, navigate]);

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gray-50 px-6 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm text-center">
          {status === "loading" && (
            <>
              <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Loader2 size={28} className="text-gray-500 animate-spin" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Verifying your email...
              </h2>
              <p className="text-gray-500 mt-2 text-sm">
                Please wait a moment.
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={28} className="text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Email verified!
              </h2>
              <p className="text-gray-500 mt-2 text-sm">{message}</p>
              <p className="text-gray-400 mt-1 text-xs">
                Redirecting to your dashboard...
              </p>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                <XCircle size={28} className="text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Verification failed
              </h2>
              <p className="text-gray-500 mt-2 text-sm">{message}</p>
              <Link
                to="/login"
                className="mt-5 inline-block text-sm font-semibold text-gray-900 hover:underline"
              >
                Back to login
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default VerifyEmail;
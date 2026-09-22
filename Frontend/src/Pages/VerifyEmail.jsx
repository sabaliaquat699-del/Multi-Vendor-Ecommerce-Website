
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { API_URL } from "../config";

function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();
  const calledRef = useRef(false);

  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;

    const verify = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/auth/verify-email/${token}`,
          {
            method: "POST",
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Verification failed."
          );
        }

        // Backend verification successful hai.
        // Backend user/token return nahi karta,
        // isliye data.user.role access nahi karna.

        setStatus("success");
        setMessage(
          data.message || "Email verified successfully!"
        );

        // Verification ke baad login page par bhej dein.
        // User apne verified account se normally login karega.
        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 1800);
      } catch (err) {
        console.error("Email verification error:", err);

        setStatus("error");
        setMessage(
          err.message ||
            "This verification link is invalid or has expired."
        );
      }
    };

    verify();
  }, [token, navigate]);

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gray-50 px-6 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm text-center">

          {/* =========================
              LOADING
          ========================== */}
          {status === "loading" && (
            <>
              <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Loader2
                  size={28}
                  className="text-gray-500 animate-spin"
                />
              </div>

              <h2 className="text-xl font-bold text-gray-900">
                Verifying your email...
              </h2>

              <p className="text-gray-500 mt-2 text-sm">
                Please wait a moment.
              </p>
            </>
          )}

          {/* =========================
              SUCCESS
          ========================== */}
          {status === "success" && (
            <>
              <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                <CheckCircle
                  size={28}
                  className="text-green-600"
                />
              </div>

              <h2 className="text-xl font-bold text-gray-900">
                Email verified!
              </h2>

              <p className="text-gray-500 mt-2 text-sm">
                {message}
              </p>

              <p className="text-gray-400 mt-1 text-xs">
                Redirecting to login...
              </p>
            </>
          )}

          {/* =========================
              ERROR
          ========================== */}
          {status === "error" && (
            <>
              <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                <XCircle
                  size={28}
                  className="text-red-600"
                />
              </div>

              <h2 className="text-xl font-bold text-gray-900">
                Verification failed
              </h2>

              <p className="text-gray-500 mt-2 text-sm">
                {message}
              </p>

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


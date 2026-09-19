import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

// Wrap a page with <ProtectedRoute role="vendor"> to make sure
// only logged-in users with that role can open it.
//  - not logged in  -> sent to the register page (vendor tab) or login
//  - wrong role     -> sent back to the home page
function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // AuthContext is still reading the saved login from localStorage
  if (loading) return null;

  if (!user) {
    const target = role === "vendor" ? "/register?role=vendor" : "/login";
    return <Navigate to={target} replace state={{ from: location }} />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import AdminSidebar from "../Components/Admin/AdminSidebar.jsx";
import { useAuth } from "../context/AuthContext.jsx";

function AdminLayout({ children, title }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex bg-gray-50">
      <AdminSidebar />

      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">{title}</h1>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              {user?.firstName} {user?.lastName}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-red-600 transition"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </header>

        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}

export default AdminLayout;
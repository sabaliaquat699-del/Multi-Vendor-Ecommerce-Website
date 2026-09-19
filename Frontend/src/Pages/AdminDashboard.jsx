import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import AdminLayout from "../Layouts/AdminLayout.jsx";
import StatCard from "../Components/Admin/StatCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { API_URL } from "../config";

function AdminDashboard() {
  const { token } = useAuth();

  const [stats, setStats] = useState(null);
  const [pendingVendors, setPendingVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;

    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [statsRes, vendorsRes] = await Promise.all([
          fetch(`${API_URL}/api/admin/dashboard-stats`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/api/admin/vendors?status=pending`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const statsData = await statsRes.json();
        const vendorsData = await vendorsRes.json();

        if (!statsRes.ok || !statsData.success) {
          throw new Error(statsData.message || "Failed to load stats.");
        }
        if (!vendorsRes.ok || !vendorsData.success) {
          throw new Error(vendorsData.message || "Failed to load vendors.");
        }

        setStats(statsData.stats);
        setPendingVendors(vendorsData.vendors.slice(0, 5));
      } catch (err) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [token]);

  return (
    <AdminLayout title="Admin Dashboard">
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-gray-500 text-sm">Loading dashboard...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard title="Total Customers" value={stats?.totalCustomers ?? 0} />
            <StatCard title="Total Vendors" value={stats?.totalVendors ?? 0} />
            <StatCard
              title="Pending Approval"
              value={stats?.pendingVendors ?? 0}
              description="Vendors waiting for review"
            />
            <StatCard title="Total Products" value={stats?.totalProducts ?? 0} />
          </div>

          <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">
                Vendors awaiting approval
              </h2>
              <Link
                to="/admin/vendors"
                className="flex items-center gap-1 text-sm font-semibold text-gray-700 hover:text-gray-900"
              >
                View all
                <ArrowRight size={14} />
              </Link>
            </div>

            {pendingVendors.length === 0 ? (
              <p className="text-sm text-gray-500">
                No pending vendors right now.
              </p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {pendingVendors.map((vendor) => (
                  <li
                    key={vendor.id}
                    className="py-3 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {vendor.storeName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {vendor.firstName} {vendor.lastName} · {vendor.email}
                      </p>
                    </div>
                    <span className="text-xs font-medium text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                      Pending
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </AdminLayout>
  );
}

export default AdminDashboard;
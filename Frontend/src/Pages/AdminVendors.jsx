import { useEffect, useState } from "react";
import { Check, X, Clock } from "lucide-react";
import AdminLayout from "../Layouts/AdminLayout.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { API_URL } from "../config";

const TABS = [
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
  { key: "", label: "All" },
];

function AdminVendors() {
  const { token } = useAuth();

  const [activeTab, setActiveTab] = useState("pending");
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const loadVendors = async (status) => {
    try {
      setLoading(true);
      setError("");

      const query = status ? `?status=${status}` : "";
      const response = await fetch(`${API_URL}/api/admin/vendors${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load vendors.");
      }

      setVendors(data.vendors);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    loadVendors(activeTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, activeTab]);

  const handleApprove = async (id) => {
    try {
      setActionLoadingId(id);
      const response = await fetch(
        `${API_URL}/api/admin/vendors/${id}/approve`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to approve vendor.");
      }

      setVendors((prev) => prev.filter((v) => v.id !== id));
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (id) => {
    try {
      setActionLoadingId(id);
      const response = await fetch(
        `${API_URL}/api/admin/vendors/${id}/reject`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ reason: rejectReason.trim() }),
        }
      );
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to reject vendor.");
      }

      setVendors((prev) => prev.filter((v) => v.id !== id));
      setRejectingId(null);
      setRejectReason("");
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <AdminLayout title="Vendor Management">
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.key || "all"}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              activeTab === tab.key
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden overflow-x-auto">
        {loading ? (
          <p className="text-sm text-gray-500 p-6">Loading vendors...</p>
        ) : vendors.length === 0 ? (
          <p className="text-sm text-gray-500 p-6">No vendors found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left">
              <tr>
                <th className="px-6 py-3 font-semibold">Store</th>
                <th className="px-6 py-3 font-semibold">Owner</th>
                <th className="px-6 py-3 font-semibold">Email</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {vendors.map((vendor) => (
                <tr key={vendor.id}>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-900">
                      {vendor.storeName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {vendor.businessName || "—"}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {vendor.firstName} {vendor.lastName}
                  </td>
                  <td className="px-6 py-4 text-gray-700">{vendor.email}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full capitalize ${
                        vendor.vendorStatus === "approved"
                          ? "bg-green-50 text-green-600"
                          : vendor.vendorStatus === "rejected"
                          ? "bg-red-50 text-red-600"
                          : "bg-amber-50 text-amber-600"
                      }`}
                    >
                      <Clock size={12} />
                      {vendor.vendorStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {vendor.vendorStatus === "pending" ? (
                      rejectingId === vendor.id ? (
                        <div className="flex flex-col items-end gap-2">
                          <input
                            type="text"
                            placeholder="Reason (optional)"
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            className="h-9 px-3 border border-gray-300 rounded-lg text-xs w-48 outline-none focus:border-gray-900"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setRejectingId(null);
                                setRejectReason("");
                              }}
                              className="text-xs text-gray-500 hover:text-gray-800"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleReject(vendor.id)}
                              disabled={actionLoadingId === vendor.id}
                              className="text-xs font-semibold text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg disabled:opacity-60"
                            >
                              Confirm Reject
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleApprove(vendor.id)}
                            disabled={actionLoadingId === vendor.id}
                            className="flex items-center gap-1 text-xs font-semibold text-white bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-lg disabled:opacity-60"
                          >
                            <Check size={14} />
                            Approve
                          </button>
                          <button
                            onClick={() => setRejectingId(vendor.id)}
                            disabled={actionLoadingId === vendor.id}
                            className="flex items-center gap-1 text-xs font-semibold text-red-600 border border-red-200 hover:bg-red-50 px-3 py-1.5 rounded-lg disabled:opacity-60"
                          >
                            <X size={14} />
                            Reject
                          </button>
                        </div>
                      )
                    ) : (
                      <span className="text-xs text-gray-400">No action</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminVendors;
"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Users, LogOut, Package, ShoppingBasket, Menu, X, RefreshCw } from "lucide-react";
import DashboardLayout from "@/app/dashboard/layout";

type Farmer = { id: string; name: string; farmName: string; location: string; verified: boolean; user: { email: string } | null; _count: { products: number } };
type Order = { id: string; customerName: string; email: string; status: string; totalPaise: number; items: any[]; user: { name: string | null } | null };

export default function AdminDashboardPage() {
  const [user, setUser] = useState<{ id: string; name: string | null; email: string; role: string } | null>(null);
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (!res.ok) {
          setError("Session expired. Please sign in again.");
          setLoading(false);
          return;
        }
        const u = await res.json();
        if (u.role !== "ADMIN") {
          setError("Admin access required.");
          setLoading(false);
          return;
        }
        setUser({ id: u.id, name: u.name, email: u.email, role: u.role });
        await fetchData();
      } catch (err) {
        setError("Failed to load session. Please try again.");
        setLoading(false);
      }
    })();
  }, []);

  const fetchData = async () => {
    try {
      const [fRes, oRes] = await Promise.all([
        fetch("/api/admin/farmers", { credentials: "include" }),
        fetch("/api/admin/orders", { credentials: "include" }),
      ]);
      if (!fRes.ok || !oRes.ok) {
        throw new Error("Failed to load dashboard data.");
      }
      const farmersData = await fRes.json();
      const ordersData = await oRes.json();
      setFarmers(farmersData);
      setOrders(ordersData);
    } catch (err: any) {
      setError(err?.message || "Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id: string, verified: boolean) => {
    try {
      const res = await fetch(`/api/admin/farmers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verified }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update");
      await fetchData();
    } catch {
      setError("Failed to update farmer verification.");
    }
  };

  const handleStatusUpdate = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update status");
      await fetchData();
    } catch {
      setError("Failed to update order status.");
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="page" style={{ padding: 40, textAlign: "center" }}>
          <div className="page-header"><h1>Loading dashboard...</h1></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout>
        <div className="page" style={{ padding: 40, textAlign: "center" }}>
          <div className="page-header"><h1>Not authenticated</h1></div>
          <p>Please sign in to access the admin dashboard.</p>
        </div>
      </DashboardLayout>
    );
  }

  const totalProducts = farmers.reduce((sum, f) => sum + (f._count?.products ?? 0), 0);
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalPaise ?? 0), 0);
  const unverifiedFarmers = farmers.filter(f => !f.verified).length;

  return (
    <DashboardLayout>
      <div className="page">
        <div className="page-header">
          <h1>Admin Dashboard</h1>
          <p>Manage farmers, products, and orders</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Farmers</div>
            <div className="stat-value">{farmers.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Products</div>
            <div className="stat-value">{totalProducts}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Orders</div>
            <div className="stat-value">{totalOrders}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Revenue</div>
            <div className="stat-value">₹{(totalRevenue / 100).toFixed(2)}</div>
          </div>
        </div>

        {error && (
          <div className="error" style={{ marginBottom: 20 }}>{error}</div>
        )}

        <div className="section">
          <div className="section-header">
            <h2>Farmers</h2>
            <span className="badge">{unverifiedFarmers} unverified</span>
          </div>
          {farmers.length === 0 ? (
            <div className="empty">No farmers found.</div>
          ) : (
            <div className="farmer-table">
              <table>
                <thead>
                  <tr><th>Farm</th><th>Farmer</th><th>Email</th><th>Location</th><th>Products</th><th>Status</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {farmers.map(f => (
                    <tr key={f.id}>
                      <td>{f.farmName}</td>
                      <td>{f.name}</td>
                      <td>{f.user?.email ?? "—"}</td>
                      <td>{f.location}</td>
                      <td>{f._count?.products ?? 0}</td>
                      <td>
                        <span className={`status-badge ${f.verified ? "verified" : "pending"}`}>
                          {f.verified ? "Verified" : "Pending"}
                        </span>
                      </td>
                      <td>
                        <button
                          className="edit-btn"
                          onClick={() => handleVerify(f.id, !f.verified)}
                        >
                          {f.verified ? "Unverify" : "Verify"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="section">
          <div className="section-header"><h2>All Orders</h2></div>
          {orders.length === 0 ? (
            <div className="empty">No orders yet.</div>
          ) : (
            <div className="order-list">
              {orders.map((o: Order) => (
                <div key={o.id} className="order-card">
                  <div className="order-header">
                    <span className="order-id">Order {o.id.slice(-6)}</span>
                    <span className="order-status">{o.status}</span>
                  </div>
                  <div className="order-customer">
                    <span>{o.customerName}</span>
                    <span>{o.email}</span>
                  </div>
                  <div className="order-items">
                    {o.items.map((i: any) => (
                      <div key={i.id} className="order-item">
                        <span>{i.quantity} × {i.productName}</span>
                        <span>₹{(i.unitPricePaise ?? 0 / 100).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="order-actions">
                    {o.status === "CONFIRMED" && (
                      <button className="primary-button" onClick={() => handleStatusUpdate(o.id, "PREPARING")}>Start Preparing</button>
                    )}
                    {o.status === "PREPARING" && (
                      <button className="primary-button" onClick={() => handleStatusUpdate(o.id, "READY_FOR_PICKUP")}>Mark Ready</button>
                    )}
                    {o.status === "READY_FOR_PICKUP" && (
                      <button className="primary-button" onClick={() => handleStatusUpdate(o.id, "OUT_FOR_DELIVERY")}>Out for Delivery</button>
                    )}
                    {o.status === "OUT_FOR_DELIVERY" && (
                      <button className="primary-button" onClick={() => handleStatusUpdate(o.id, "DELIVERED")}>Mark Delivered</button>
                    )}
                    {o.status !== "CANCELLED" && o.status !== "DELIVERED" && (
                      <button className="edit-btn" onClick={() => handleStatusUpdate(o.id, "CANCELLED")} style={{ color: "#8a1f1f", borderColor: "#8a1f1f" }}>Cancel</button>
                    )}
                  </div>
                  <div className="order-total">
                    <span>Total:</span>
                    <strong>₹{(o.totalPaise ?? 0 / 100).toFixed(2)}</strong>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

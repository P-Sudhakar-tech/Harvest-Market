"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

const LayoutDashboardIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"></rect>
    <rect x="14" y="3" width="7" height="7"></rect>
    <rect x="14" y="14" width="7" height="7"></rect>
    <rect x="3" y="14" width="7" height="7"></rect>
  </svg>
);
const PackageIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="16.5" y1="9.4" x2="7.5" y2="4.2"></line>
    <path></path>
    <path></path>
  </svg>
);
const ShoppingBasketIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="21" y1="4" x2="14" y2="14"></line>
    <path></path>
    <line x1="3" y1="4" x2="21" y2="4"></line>
    <line x1="10" y1="4" x2="10" y2="21"></line>
  </svg>
);
const UsersIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path></path>
  </svg>
);
const MenuIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
);
const XIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);
const LogOutIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path></path>
    <line x1="9" y1="21" x2="15" y2="9"></line>
    <line x1="9" y1="3" x2="15" y2="9"></line>
  </svg>
);

type Farmer = { id: string; name: string; farmName: string; location: string; verified: boolean; user: { email: string } | null; _count: { products: number } };
type Order = { id: string; customerName: string; email: string; status: string; totalPaise: number; items: any[]; user: { name: string | null } | null };

const NAV_ITEMS = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboardIcon },
  { name: "Products", href: "/dashboard/products", icon: PackageIcon },
  { name: "Orders", href: "/dashboard/orders", icon: ShoppingBasketIcon },
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ id: string; name: string | null; email: string; role: string } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

  const isAdmin = user?.role === "ADMIN";
  const activeNav = NAV_ITEMS.find((n) => pathname === n.href);

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <h1>Loading dashboard...</h1>
      </div>
    );
  }

  if (!user || error) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "#8a1f1f" }}>
        <h1>{error || "Not authenticated"}</h1>
        <p>Please sign in to access the admin dashboard.</p>
        <a href="/auth/signin" style={{ color: "#294b35", textDecoration: "underline" }}>
          Sign in here
        </a>
      </div>
    );
  }

  const totalProducts = farmers.reduce((sum, f) => sum + (f._count?.products ?? 0), 0);
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalPaise ?? 0), 0);
  const unverifiedFarmers = farmers.filter((f) => !f.verified).length;

  return (
    <div className="dashboard-shell" style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <aside
        className="sidebar"
        style={{
          position: "fixed",
          top: 0,
          bottom: 0,
          left: 0,
          width: "260px",
          height: "100%",
          background: "#fff",
          borderRight: "1px solid #e5e6dc",
          zIndex: 30,
          display: "flex",
          flexDirection: "column",
          transform: sidebarOpen ? "translateX(0)" : "translateX(0)",
          transition: "transform 0.25s",
        }}
      >
        <div className="sidebar-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid #e5e6dc" }}>
          <div className="brand" style={{ fontWeight: "700", color: "#294b35", fontSize: "16px" }}>Admin Hub</div>
          <button className="close-btn" onClick={() => setSidebarOpen(false)} style={{ background: "none", border: "none", color: "#7c8275", cursor: "pointer", padding: 4 }}>
            <XIcon />
          </button>
        </div>
        <nav style={{ padding: "16px 0", flex: 1, overflowY: "auto" }}>
          {NAV_ITEMS.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className={`nav-item ${activeNav?.name === item.name ? "active" : ""}`}
              onClick={() => setSidebarOpen(false)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 20px",
                fontSize: 13,
                color: activeNav?.name === item.name ? "#294b35" : "#7c8275",
                textDecoration: "none",
                background: activeNav?.name === item.name ? "#294b35" : "transparent",
              }}
            >
              <item.icon />
              {item.name}
            </a>
          ))}
          {isAdmin && (
            <a
              href="/dashboard/admin"
              className={`nav-item ${pathname.startsWith("/dashboard/admin") ? "active" : ""}`}
              onClick={() => setSidebarOpen(false)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 20px",
                fontSize: 13,
                color: "#fff",
                textDecoration: "none",
                background: "#294b35",
              }}
            >
              <UsersIcon />
              Admin
            </a>
          )}
        </nav>
        <div className="sidebar-footer" style={{ padding: "16px 20px", borderTop: "1px solid #e5e6dc", display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="user-info" style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <div className="user-name" style={{ fontWeight: "600", fontSize: "14px", color: "#29352a" }}>
              {user.name || user.email}
            </div>
            <div className="user-role" style={{ fontSize: "10px", color: "#7c8275", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              {user.role}
            </div>
          </div>
          <button
            className="signout-btn"
            onClick={() => {
              fetch("/api/auth/signout", { method: "POST", credentials: "include" }).then(() => router.push("/"));
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              width: "100%",
              padding: "8px 12px",
              background: "transparent",
              border: "1px solid #e5e6dc",
              borderRadius: 4,
              color: "#7c8275",
              fontSize: "12px",
              cursor: "pointer",
            }}
          >
            <LogOutIcon /> Sign out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="dashboard-main" style={{ marginLeft: "260px", flex: 1, overflowY: "auto" }}>
        <header className="dashboard-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", borderBottom: "1px solid #e5e6dc", background: "#fff" }}>
          <button className="menu-btn" onClick={() => setSidebarOpen(true)} style={{ background: "none", border: "none", color: "#7c8275", cursor: "pointer" }}>
            <MenuIcon />
          </button>
          <div className="title" style={{ fontWeight: "700", fontSize: "16px", color: "#29352a" }}>
            {activeNav?.name || "Dashboard"}
          </div>
        </header>
        <main className="dashboard-content" style={{ padding: 24 }}>
          <div className="page">
            <div className="page-header" style={{ marginBottom: 24 }}>
              <h1 style={{ fontSize: "20px", fontWeight: "700", color: "#203c2b", marginTop: 0 }}>
                Admin Dashboard
              </h1>
              <p style={{ fontSize: "13px", color: "#7c8275", marginTop: 4 }}>
                Manage farmers, products, and orders
              </p>
            </div>

            <div
              className="stats-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                gap: 16,
                marginBottom: 24,
              }}
            >
              <div className="stat-card" style={{ background: "#fff", border: "1px solid #e5e6dc", borderRadius: 8, padding: 16 }}>
                <div className="stat-label" style={{ fontSize: "11px", fontWeight: "700", color: "#7c8275", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Farmers
                </div>
                <div className="stat-value" style={{ fontSize: "24px", fontWeight: "700", color: "#203c2b", marginTop: 6 }}>
                  {farmers.length}
                </div>
              </div>
              <div className="stat-card" style={{ background: "#fff", border: "1px solid #e5e6dc", borderRadius: 8, padding: 16 }}>
                <div className="stat-label" style={{ fontSize: "11px", fontWeight: "700", color: "#7c8275", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Products
                </div>
                <div className="stat-value" style={{ fontSize: "24px", fontWeight: "700", color: "#203c2b", marginTop: 6 }}>
                  {totalProducts}
                </div>
              </div>
              <div className="stat-card" style={{ background: "#fff", border: "1px solid #e5e6dc", borderRadius: 8, padding: 16 }}>
                <div className="stat-label" style={{ fontSize: "11px", fontWeight: "700", color: "#7c8275", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Orders
                </div>
                <div className="stat-value" style={{ fontSize: "24px", fontWeight: "700", color: "#203c2b", marginTop: 6 }}>
                  {totalOrders}
                </div>
              </div>
              <div className="stat-card" style={{ background: "#fff", border: "1px solid #e5e6dc", borderRadius: 8, padding: 16 }}>
                <div className="stat-label" style={{ fontSize: "11px", fontWeight: "700", color: "#7c8275", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Revenue
                </div>
                <div className="stat-value" style={{ fontSize: "24px", fontWeight: "700", color: "#203c2b", marginTop: 6 }}>
                  ₹{(totalRevenue / 100).toFixed(2)}
                </div>
              </div>
            </div>

            {error && (
              <div className="error" style={{ background: "#fdecea", color: "#8a1f1f", padding: "10px 14px", borderRadius: 4, border: "1px solid #f5c6c7", marginBottom: 20 }}>
                {error}
              </div>
            )}

            <div className="section" style={{ background: "#fff", border: "1px solid #e5e6dc", borderRadius: 8, padding: 20, marginBottom: 20 }}>
              <div className="section-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <h2 style={{ fontSize: "16px", fontWeight: "700", color: "#203c2b", margin: 0 }}>
                  Farmers
                </h2>
                <span className="badge" style={{ fontSize: "11px", fontWeight: "700", color: "#8a1f1f", background: "#fdecea", padding: "2px 8px", borderRadius: 10 }}>
                  {unverifiedFarmers} unverified
                </span>
              </div>
              {farmers.length === 0 ? (
                <div className="empty" style={{ textAlign: "center", padding: 32, color: "#7c8275", fontSize: 13 }}>
                  No farmers found.
                </div>
              ) : (
                <div className="farmer-table" style={{ width: "100%", overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: "left", padding: "10px 12px", fontSize: 11, fontWeight: "700", color: "#7c8275", textTransform: "uppercase", borderBottom: "1px solid #e5e6dc" }}>
                          Farm
                        </th>
                        <th style={{ textAlign: "left", padding: "10px 12px", fontSize: 11, fontWeight: "700", color: "#7c8275", textTransform: "uppercase", borderBottom: "1px solid #e5e6dc" }}>
                          Farmer
                        </th>
                        <th style={{ textAlign: "left", padding: "10px 12px", fontSize: 11, fontWeight: "700", color: "#7c8275", textTransform: "uppercase", borderBottom: "1px solid #e5e6dc" }}>
                          Email
                        </th>
                        <th style={{ textAlign: "left", padding: "10px 12px", fontSize: 11, fontWeight: "700", color: "#7c8275", textTransform: "uppercase", borderBottom: "1px solid #e5e6dc" }}>
                          Location
                        </th>
                        <th style={{ textAlign: "left", padding: "10px 12px", fontSize: 11, fontWeight: "700", color: "#7c8275", textTransform: "uppercase", borderBottom: "1px solid #e5e6dc" }}>
                          Products
                        </th>
                        <th style={{ textAlign: "left", padding: "10px 12px", fontSize: 11, fontWeight: "700", color: "#7c8275", textTransform: "uppercase", borderBottom: "1px solid #e5e6dc" }}>
                          Status
                        </th>
                        <th style={{ textAlign: "left", padding: "10px 12px", fontSize: 11, fontWeight: "700", color: "#7c8275", textTransform: "uppercase", borderBottom: "1px solid #e5e6dc" }}>
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {farmers.map((f) => (
                        <tr key={f.id} style={{ borderBottom: "1px solid #e5e6dc" }}>
                          <td style={{ textAlign: "left", padding: "10px 12px", fontSize: 13 }}>{f.farmName}</td>
                          <td style={{ textAlign: "left", padding: "10px 12px", fontSize: 13 }}>{f.name}</td>
                          <td style={{ textAlign: "left", padding: "10px 12px", fontSize: 13 }}>{f.user?.email ?? "—"}</td>
                          <td style={{ textAlign: "left", padding: "10px 12px", fontSize: 13 }}>{f.location}</td>
                          <td style={{ textAlign: "left", padding: "10px 12px", fontSize: 13 }}>{f._count?.products ?? 0}</td>
                          <td style={{ textAlign: "left", padding: "10px 12px", fontSize: 13 }}>
                            <span
                              className={`status-badge ${f.verified ? "verified" : "pending"}`}
                              style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: f.verified ? "#2e7d32" : "#8a1f1f", background: f.verified ? "#e8f5e9" : "#fdecea", padding: "2px 8px", borderRadius: 10 }}
                            >
                              {f.verified ? "Verified" : "Pending"}
                            </span>
                          </td>
                          <td style={{ textAlign: "left", padding: "10px 12px", fontSize: 13 }}>
                            <button
                              className="edit-btn"
                              onClick={() => handleVerify(f.id, !f.verified)}
                              style={{
                                background: "none",
                                border: "1px solid #e5e6dc",
                                borderRadius: 4,
                                padding: "4px 10px",
                                fontSize: 12,
                                color: "#294b35",
                                cursor: "pointer",
                              }}
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

            <div className="section" style={{ background: "#fff", border: "1px solid #e5e6dc", borderRadius: 8, padding: 20, marginBottom: 20 }}>
              <div className="section-header" style={{ marginBottom: 16 }}>
                <h2 style={{ fontSize: "16px", fontWeight: "700", color: "#203c2b", margin: 0 }}>
                  All Orders
                </h2>
              </div>
              {orders.length === 0 ? (
                <div className="empty" style={{ textAlign: "center", padding: 32, color: "#7c8275", fontSize: 13 }}>
                  No orders yet.
                </div>
              ) : (
                <div className="order-list" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {orders.map((o: Order) => (
                    <div key={o.id} className="order-card" style={{ border: "1px solid #e5e6dc", borderRadius: 6, padding: 14 }}>
                      <div className="order-header" style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                        <span className="order-id" style={{ fontWeight: "700", fontSize: 13, color: "#203c2b" }}>
                          Order {o.id.slice(-6)}
                        </span>
                        <span className="order-status" style={{ fontSize: 11, fontWeight: "700", textTransform: "uppercase", color: "#294b35" }}>
                          {o.status}
                        </span>
                      </div>
                      <div className="order-customer" style={{ display: "flex", gap: 12, fontSize: 12, color: "#7c8275", marginBottom: 8 }}>
                        <span>{o.customerName}</span>
                        <span>{o.email}</span>
                      </div>
                      <div className="order-items">
                        {o.items.map((i: any) => (
                          <div key={i.id} className="order-item" style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#29352a", marginBottom: 4 }}>
                            <span>{i.quantity} × {i.productName}</span>
                            <span>₹{(i.unitPricePaise / 100).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="order-actions" style={{ marginTop: 8 }}>
                        {o.status === "CONFIRMED" && (
                          <button
                            className="primary-button"
                            onClick={() => handleStatusUpdate(o.id, "PREPARING")}
                            style={{
                              background: "#294b35",
                              color: "#fff",
                              border: "none",
                              borderRadius: 4,
                              padding: "6px 12px",
                              fontSize: 12,
                              cursor: "pointer",
                              marginRight: 8,
                            }}
                          >
                            Start Preparing
                          </button>
                        )}
                        {o.status === "PREPARING" && (
                          <button
                            className="primary-button"
                            onClick={() => handleStatusUpdate(o.id, "READY_FOR_PICKUP")}
                            style={{
                              background: "#294b35",
                              color: "#fff",
                              border: "none",
                              borderRadius: 4,
                              padding: "6px 12px",
                              fontSize: 12,
                              cursor: "pointer",
                              marginRight: 8,
                            }}
                          >
                            Mark Ready
                          </button>
                        )}
                        {o.status === "READY_FOR_PICKUP" && (
                          <button
                            className="primary-button"
                            onClick={() => handleStatusUpdate(o.id, "OUT_FOR_DELIVERY")}
                            style={{
                              background: "#294b35",
                              color: "#fff",
                              border: "none",
                              borderRadius: 4,
                              padding: "6px 12px",
                              fontSize: 12,
                              cursor: "pointer",
                              marginRight: 8,
                            }}
                          >
                            Out for Delivery
                          </button>
                        )}
                        {o.status === "OUT_FOR_DELIVERY" && (
                          <button
                            className="primary-button"
                            onClick={() => handleStatusUpdate(o.id, "DELIVERED")}
                            style={{
                              background: "#294b35",
                              color: "#fff",
                              border: "none",
                              borderRadius: 4,
                              padding: "6px 12px",
                              fontSize: 12,
                              cursor: "pointer",
                              marginRight: 8,
                            }}
                          >
                            Mark Delivered
                          </button>
                        )}
                        {o.status !== "CANCELLED" && o.status !== "DELIVERED" && (
                          <button
                            className="edit-btn"
                            onClick={() => handleStatusUpdate(o.id, "CANCELLED")}
                            style={{
                              background: "none",
                              border: "1px solid #8a1f1f",
                              borderRadius: 4,
                              padding: "4px 10px",
                              fontSize: 12,
                              color: "#8a1f1f",
                              cursor: "pointer",
                            }}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                      <div className="order-total" style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 13, fontWeight: "700", color: "#203c2b" }}>
                        <span>Total:</span>
                        <strong>₹{(o.totalPaise / 100).toFixed(2)}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

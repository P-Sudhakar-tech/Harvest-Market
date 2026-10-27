"use client";

import React, { useEffect, useState, FormEvent } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Plus,
  Trash2,
  Edit3,
  Save,
  X,
  RefreshCw,
  Menu,
  LogOut,
  LayoutDashboard,
  Package,
  ShoppingBasket,
} from "lucide-react";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Products", href: "/dashboard/products", icon: Package },
  { name: "Orders", href: "/dashboard/orders", icon: ShoppingBasket },
];

type Product = { id: string; name: string; description: string; category: string; pricePaise: number; unit: string; image: string; stock: number; featured: boolean; active: boolean };

export default function FarmerDashboardPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ id: string; name: string | null; email: string; role: string } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", description: "", category: "", pricePaise: "", unit: "kg", image: "", stock: "" });

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
        if (u.role !== "FARMER" && u.role !== "ADMIN") {
          setError("Farmer or admin access required.");
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
      const [pRes, oRes] = await Promise.all([
        fetch("/api/admin/products", { credentials: "include" }),
        fetch("/api/admin/orders", { credentials: "include" }),
      ]);
      if (!pRes.ok || !oRes.ok) {
        throw new Error("Failed to load dashboard data.");
      }
      const productsData = await pRes.json();
      const ordersData = await oRes.json();
      setProducts(productsData);
      setOrders(ordersData);
    } catch (err: any) {
      setError(err?.message || "Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          pricePaise: parseInt(form.pricePaise) || 0,
          stock: parseInt(form.stock) || 0,
          farmerId: "temp",
        }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create product");
      setAdding(false);
      setForm({ name: "", description: "", category: "", pricePaise: "", unit: "kg", image: "", stock: "" });
      await fetchData();
    } catch (err: any) {
      setError(err?.message || "Failed to create product.");
    }
  };

  const handleUpdate = async (id: string, e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update");
      setEditingId(null);
      await fetchData();
    } catch {
      setError("Failed to update product.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete");
      await fetchData();
    } catch {
      setError("Failed to delete product.");
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
        <p>Please sign in to access the farmer dashboard.</p>
        <a href="/auth/signin" style={{ color: "#294b35", textDecoration: "underline" }}>
          Sign in here
        </a>
      </div>
    );
  }

  const lowStock = products.filter((p) => p.stock <= 5 && p.stock > 0).length;
  const outOfStock = products.filter((p) => p.stock === 0).length;

  return (
    <div className="dashboard-shell" style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <aside
        className="sidebar"
        style={{
          position: "fixed",
          top: 0, bottom: 0,
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
          <div className="brand" style={{ fontWeight: "700", color: "#294b35", fontSize: "16px" }}>Farmer Hub</div>
          <button className="close-btn" onClick={() => setSidebarOpen(false)} style={{ background: "none", border: "none", color: "#7c8275", cursor: "pointer", padding: 4 }}>
            <X size={20} />
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
              {item.icon && React.createElement(item.icon, { size: 18 })}
              {item.name}
            </a>
          ))}
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
            <LogOut size={18} /> Sign out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="dashboard-main" style={{ marginLeft: "260px", flex: 1, overflowY: "auto" }}>
        <header className="dashboard-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", borderBottom: "1px solid #e5e6dc", background: "#fff" }}>
          <button className="menu-btn" onClick={() => setSidebarOpen(true)} style={{ background: "none", border: "none", color: "#7c8275", cursor: "pointer" }}>
            <Menu size={22} />
          </button>
          <div className="title" style={{ fontWeight: "700", fontSize: "16px", color: "#29352a" }}>
            {activeNav?.name || "Dashboard"}
          </div>
        </header>
        <main className="dashboard-content" style={{ padding: 24 }}>
          <div className="page">
            <div className="page-header" style={{ marginBottom: 24 }}>
              <h1 style={{ fontSize: "20px", fontWeight: "700", color: "#203c2b", marginTop: 0 }}>
                Farmer Dashboard
              </h1>
              <p style={{ fontSize: "13px", color: "#7c8275", marginTop: 4 }}>
                Manage your products, stock, and orders
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
                  Total Products
                </div>
                <div className="stat-value" style={{ fontSize: "24px", fontWeight: "700", color: "#203c2b", marginTop: 6 }}>
                  {products.length}
                </div>
              </div>
              <div className="stat-card" style={{ background: "#fff", border: "1px solid #e5e6dc", borderRadius: 8, padding: 16 }}>
                <div className="stat-label" style={{ fontSize: "11px", fontWeight: "700", color: "#7c8275", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Low Stock (≤5)
                </div>
                <div className="stat-value" style={{ fontSize: "24px", fontWeight: "700", color: "#203c2b", marginTop: 6 }}>
                  {lowStock}
                </div>
              </div>
              <div className="stat-card" style={{ background: "#fff", border: "1px solid #e5e6dc", borderRadius: 8, padding: 16 }}>
                <div className="stat-label" style={{ fontSize: "11px", fontWeight: "700", color: "#7c8275", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Out of Stock
                </div>
                <div className="stat-value" style={{ fontSize: "24px", fontWeight: "700", color: "#203c2b", marginTop: 6 }}>
                  {outOfStock}
                </div>
              </div>
              <div className="stat-card" style={{ background: "#fff", border: "1px solid #e5e6dc", borderRadius: 8, padding: 16 }}>
                <div className="stat-label" style={{ fontSize: "11px", fontWeight: "700", color: "#7c8275", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Recent Orders
                </div>
                <div className="stat-value" style={{ fontSize: "24px", fontWeight: "700", color: "#203c2b", marginTop: 6 }}>
                  {orders.length}
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
                  Your Products
                </h2>
                <button
                  className="primary-button"
                  onClick={() => setAdding(!adding)}
                  style={{
                    background: "#294b35",
                    color: "#fff",
                    border: "none",
                    borderRadius: 4,
                    padding: "8px 16px",
                    fontSize: 12,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  {adding ? "Cancel" : <><Plus size={16} /> Add Product</>}</button>
              </div>

              {adding && (
                <form onSubmit={handleCreate} className="auth-form" style={{ marginBottom: 20 }}>
                  <div className="field">
                    <label style={{ fontSize: "12px", fontWeight: "600", color: "#29352a" }}>Product name</label>
                    <input
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      style={{ width: "100%", padding: "8px 12px", border: "1px solid #e5e6dc", borderRadius: 4, background: "#fff", fontSize: 13, color: "#29352a" }}
                    />
                  </div>
                  <div className="field">
                    <label style={{ fontSize: "12px", fontWeight: "600", color: "#29352a" }}>Category</label>
                    <input
                      required
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      style={{ width: "100%", padding: "8px 12px", border: "1px solid #e5e6dc", borderRadius: 4, background: "#fff", fontSize: 13, color: "#29352a" }}
                    />
                  </div>
                  <div className="field">
                    <label style={{ fontSize: "12px", fontWeight: "600", color: "#29352a" }}>Price (₹)</label>
                    <input
                      type="number"
                      required
                      value={form.pricePaise}
                      onChange={(e) => setForm({ ...form, pricePaise: e.target.value })}
                      style={{ width: "100%", padding: "8px 12px", border: "1px solid #e5e6dc", borderRadius: 4, background: "#fff", fontSize: 13, color: "#29352a" }}
                    />
                  </div>
                  <div className="field">
                    <label style={{ fontSize: "12px", fontWeight: "600", color: "#29352a" }}>Unit</label>
                    <input
                      value={form.unit}
                      onChange={(e) => setForm({ ...form, unit: e.target.value })}
                      style={{ width: "100%", padding: "8px 12px", border: "1px solid #e5e6dc", borderRadius: 4, background: "#fff", fontSize: 13, color: "#29352a" }}
                    />
                  </div>
                  <div className="field">
                    <label style={{ fontSize: "12px", fontWeight: "600", color: "#29352a" }}>Image URL</label>
                    <input
                      value={form.image}
                      onChange={(e) => setForm({ ...form, image: e.target.value })}
                      style={{ width: "100%", padding: "8px 12px", border: "1px solid #e5e6dc", borderRadius: 4, background: "#fff", fontSize: 13, color: "#29352a" }}
                    />
                  </div>
                  <div className="field">
                    <label style={{ fontSize: "12px", fontWeight: "600", color: "#29352a" }}>Stock</label>
                    <input
                      type="number"
                      required
                      value={form.stock}
                      onChange={(e) => setForm({ ...form, stock: e.target.value })}
                      style={{ width: "100%", padding: "8px 12px", border: "1px solid #e5e6dc", borderRadius: 4, background: "#fff", fontSize: 13, color: "#29352a" }}
                    />
                  </div>
                  <div className="field">
                    <label style={{ fontSize: "12px", fontWeight: "600", color: "#29352a" }}>Description</label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      style={{ width: "100%", padding: "8px 12px", border: "1px solid #e5e6dc", borderRadius: 4, background: "#fff", fontSize: 13, color: "#29352a" }}
                    />
                  </div>
                  <button type="submit" className="primary-button full-button" style={{ background: "#294b35", color: "#fff", border: "none", borderRadius: 4, padding: "8px 16px", fontSize: 13, cursor: "pointer", width: "100%" }}>
                    Create Product
                  </button>
                  <button
                    type="button"
                    className="secondary-button full-button"
                    onClick={() => setAdding(false)}
                    style={{ background: "#fff", border: "1px solid #e5e6dc", borderRadius: 4, padding: "8px 16px", fontSize: 13, cursor: "pointer", width: "100%", color: "#7c8275", marginTop: 8 }}
                  >
                    Cancel
                  </button>
                </form>
              )}

              {products.length === 0 ? (
                <div className="empty" style={{ textAlign: "center", padding: 32, color: "#7c8275", fontSize: 13 }}>
                  No products yet. Add your first product above.
                </div>
              ) : (
                <div className="product-table" style={{ width: "100%", overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: "left", padding: "10px 12px", fontSize: 11, fontWeight: "700", color: "#7c8275", textTransform: "uppercase", borderBottom: "1px solid #e5e6dc" }}>
                          Product
                        </th>
                        <th style={{ textAlign: "left", padding: "10px 12px", fontSize: 11, fontWeight: "700", color: "#7c8275", textTransform: "uppercase", borderBottom: "1px solid #e5e6dc" }}>
                          Category
                        </th>
                        <th style={{ textAlign: "left", padding: "10px 12px", fontSize: 11, fontWeight: "700", color: "#7c8275", textTransform: "uppercase", borderBottom: "1px solid #e5e6dc" }}>
                          Price
                        </th>
                        <th style={{ textAlign: "left", padding: "10px 12px", fontSize: 11, fontWeight: "700", color: "#7c8275", textTransform: "uppercase", borderBottom: "1px solid #e5e6dc" }}>
                          Stock
                        </th>
                        <th style={{ textAlign: "left", padding: "10px 12px", fontSize: 11, fontWeight: "700", color: "#7c8275", textTransform: "uppercase", borderBottom: "1px solid #e5e6dc" }}>
                          Status
                        </th>
                        <th style={{ textAlign: "left", padding: "10px 12px", fontSize: 11, fontWeight: "700", color: "#7c8275", textTransform: "uppercase", borderBottom: "1px solid #e5e6dc" }}>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((p) => {
                        const isEditing = editingId === p.id;
                        return (
                          <tr key={p.id} style={{ borderBottom: "1px solid #e5e6dc" }}>
                            <td style={{ textAlign: "left", padding: "10px 12px", fontSize: 13 }}>
                              {isEditing ? (
                                <input
                                  defaultValue={p.name}
                                  style={{ width: "100%", padding: "4px 8px", border: "1px solid #e5e6dc", borderRadius: 4 }}
                                />
                              ) : (
                                p.name
                              )}
                            </td>
                            <td style={{ textAlign: "left", padding: "10px 12px", fontSize: 13 }}>{p.category}</td>
                            <td style={{ textAlign: "left", padding: "10px 12px", fontSize: 13 }}>
                              ₹{(p.pricePaise / 100).toFixed(2)}
                            </td>
                            <td
                              style={{
                                textAlign: "left",
                                padding: "10px 12px",
                                fontSize: 13,
                                fontWeight: "600",
                                color:
                                  p.stock === 0
                                    ? "#8a1f1f"
                                    : p.stock <= 5
                                    ? "#d88b52"
                                    : "#2e7d32",
                              }}
                            >
                              {p.stock === 0 ? "Out" : p.stock <= 5 ? `Low (${p.stock})` : p.stock}
                            </td>
                            <td style={{ textAlign: "left", padding: "10px 12px", fontSize: 13 }}>
                              {p.active ? "Active" : "Inactive"}
                            </td>
                            <td style={{ textAlign: "left", padding: "10px 12px", fontSize: 13 }}>
                              {isEditing ? (
                                <>
                                  <button
                                    className="edit-btn"
                                    onClick={() => {
                                      setForm({
                                        name: p.name,
                                        description: p.description,
                                        category: p.category,
                                        pricePaise: String(p.pricePaise),
                                        unit: p.unit,
                                        image: p.image,
                                        stock: String(p.stock),
                                      });
                                      setEditingId(p.id);
                                    }}
                                    style={{
                                      background: "none",
                                      border: "1px solid #e5e6dc",
                                      borderRadius: 4,
                                      padding: "4px 10px",
                                      fontSize: 12,
                                      color: "#294b35",
                                      cursor: "pointer",
                                      marginRight: 6,
                                    }}
                                  >
                                    Save
                                  </button>
                                  <button
                                    className="edit-btn"
                                    onClick={() => setEditingId(null)}
                                    style={{
                                      background: "none",
                                      border: "1px solid #e5e6dc",
                                      borderRadius: 4,
                                      padding: "4px 10px",
                                      fontSize: 12,
                                      color: "#7c8275",
                                      cursor: "pointer",
                                    }}
                                  >
                                    Cancel
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    className="edit-btn"
                                    onClick={() => setEditingId(p.id)}
                                    style={{
                                      background: "none",
                                      border: "1px solid #e5e6dc",
                                      borderRadius: 4,
                                      padding: "4px 10px",
                                      fontSize: 12,
                                      color: "#294b35",
                                      cursor: "pointer",
                                      marginRight: 6,
                                    }}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    className="edit-btn"
                                    onClick={() => handleDelete(p.id)}
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
                                    Delete
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="section" style={{ background: "#fff", border: "1px solid #e5e6dc", borderRadius: 8, padding: 20, marginBottom: 20 }}>
              <div className="section-header" style={{ marginBottom: 16 }}>
                <h2 style={{ fontSize: "16px", fontWeight: "700", color: "#203c2b", margin: 0 }}>Recent Orders</h2>
              </div>
              {orders.length === 0 ? (
                <div className="empty" style={{ textAlign: "center", padding: 32, color: "#7c8275", fontSize: 13 }}>
                  No orders yet.
                </div>
              ) : (
                <div className="order-list" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {orders.map((o: any) => {
                    const farmerItems = o.items.filter((i: any) => i.product && i.product.farmerId === user.id);
                    return (
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
                          {farmerItems.map((i: any) => (
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
                        </div>
                        <div className="order-total" style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 13, fontWeight: "700", color: "#203c2b" }}>
                          <span>Total:</span>
                          <strong>₹{(o.totalPaise / 100).toFixed(2)}</strong>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

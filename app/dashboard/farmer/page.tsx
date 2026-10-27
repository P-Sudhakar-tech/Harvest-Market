"use client";

import { useEffect, useState, FormEvent } from "react";
import { Plus, Trash2, Edit3, Save, X, RefreshCw, Menu, LogOut, LayoutDashboard, Package, ShoppingBasket } from "lucide-react";
import DashboardLayout from "@/app/dashboard/layout";

type Product = { id: string; name: string; description: string; category: string; pricePaise: number; unit: string; image: string; stock: number; featured: boolean; active: boolean };

export default function FarmerDashboardPage() {
  const [user, setUser] = useState<{ id: string; name: string | null; email: string; role: string } | null>(null);
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
          <p>Please sign in to access the farmer dashboard.</p>
        </div>
      </DashboardLayout>
    );
  }

  const lowStock = products.filter(p => p.stock <= 5 && p.stock > 0).length;
  const outOfStock = products.filter(p => p.stock === 0).length;

  return (
    <DashboardLayout>
      <div className="page">
        <div className="page-header">
          <h1>Farmer Dashboard</h1>
          <p>Manage your products, stock, and orders</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Total Products</div>
            <div className="stat-value">{products.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Low Stock (≤5)</div>
            <div className="stat-value">{lowStock}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Out of Stock</div>
            <div className="stat-value">{outOfStock}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Recent Orders</div>
            <div className="stat-value">{orders.length}</div>
          </div>
        </div>

        {error && (
          <div className="error" style={{ marginBottom: 20 }}>{error}</div>
        )}

        <div className="section">
          <div className="section-header">
            <h2>Your Products</h2>
            <button className="primary-button" onClick={() => setAdding(!adding)}>{adding ? "Cancel" : (<><Plus size={16} /> Add Product</>)}</button>
          </div>

          {adding && (
            <form onSubmit={handleCreate} className="auth-form" style={{ marginBottom: 20 }}>
              <div className="field">
                <label>Product name</label>
                <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="field">
                <label>Category</label>
                <input required value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
              </div>
              <div className="field">
                <label>Price (₹)</label>
                <input type="number" required value={form.pricePaise} onChange={e => setForm({ ...form, pricePaise: e.target.value })} />
              </div>
              <div className="field">
                <label>Unit</label>
                <input value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} />
              </div>
              <div className="field">
                <label>Image URL</label>
                <input value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} />
              </div>
              <div className="field">
                <label>Stock</label>
                <input type="number" required value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} />
              </div>
              <div className="field">
                <label>Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <button type="submit" className="primary-button full-button">Create Product</button>
              <button type="button" className="secondary-button full-button" onClick={() => setAdding(false)}>Cancel</button>
            </form>
          )}

          {products.length === 0 ? (
            <div className="empty">No products yet. Add your first product above.</div>
          ) : (
            <div className="product-table">
              <table>
                <thead>
                  <tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {products.map(p => {
                    const isEditing = editingId === p.id;
                    return (
                      <tr key={p.id}>
                        <td>{isEditing ? <input defaultValue={p.name} /> : p.name}</td>
                        <td>{p.category}</td>
                        <td>₹{(p.pricePaise / 100).toFixed(2)}</td>
                        <td className={`stock-cell ${p.stock === 0 ? "out" : p.stock <= 5 ? "low" : "ok"}`}>
                          {p.stock === 0 ? "Out" : p.stock <= 5 ? `Low (${p.stock})` : p.stock}
                        </td>
                        <td>{p.active ? "Active" : "Inactive"}</td>
                        <td>
                          {isEditing ? (
                            <>
                              <button className="edit-btn" onClick={() => { setForm({ name: p.name, description: p.description, category: p.category, pricePaise: String(p.pricePaise), unit: p.unit, image: p.image, stock: String(p.stock) }); setEditingId(p.id); }}>Save</button>
                              <button className="edit-btn" onClick={() => setEditingId(null)}>Cancel</button>
                            </>
                          ) : (
                            <>
                              <button className="edit-btn" onClick={() => setEditingId(p.id)}>Edit</button>
                              <button className="edit-btn" onClick={() => handleDelete(p.id)} style={{ color: "#8a1f1f", borderColor: "#8a1f1f" }}>Delete</button>
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

        <div className="section">
          <div className="section-header"><h2>Recent Orders</h2></div>
          {orders.length === 0 ? (
            <div className="empty">No orders yet.</div>
          ) : (
            <div className="order-list">
              {orders.map((o: any) => {
                const farmerItems = o.items.filter((i: any) => i.product && i.product.farmerId === user.id);
                return (
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
                      {farmerItems.map((i: any) => (
                        <div key={i.id} className="order-item">
                          <span>{i.quantity} × {i.productName}</span>
                          <span>₹{(i.unitPricePaise / 100).toFixed(2)}</span>
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
                    </div>
                    <div className="order-total">
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
    </DashboardLayout>
  );
}

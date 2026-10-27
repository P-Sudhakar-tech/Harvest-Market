import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import DashboardLayout from "@/app/dashboard/layout";

export default async function FarmerDashboardPage() {
  const user = await getSessionUser();
  if (!user || (user.role !== "FARMER" && user.role !== "ADMIN")) {
    return <DashboardLayout><div className="page"><div className="page-header"><h1>Access Denied</h1><p>You do not have permission to view this dashboard.</p></div></div></DashboardLayout>;
  }

  const farmer = user.role === "FARMER"
    ? await db.farmer.findFirst({ where: { userId: user.id }, include: { products: true } })
    : null;

  const products = farmer?.products ?? [];
  const lowStock = products.filter(p => p.stock <= 5 && p.stock > 0);
  const outOfStock = products.filter(p => p.stock === 0);

  const orders = await db.order.findMany({
    where: { items: { some: { product: { farmerId: farmer?.id ?? "" } } } },
    include: { items: { where: { product: { farmerId: farmer?.id ?? "" } } } },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

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
            <div className="stat-value">{lowStock.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Out of Stock</div>
            <div className="stat-value">{outOfStock.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Recent Orders</div>
            <div className="stat-value">{orders.length}</div>
          </div>
        </div>

        <div className="section">
          <div className="section-header">
            <h2>Your Products</h2>
          </div>
          {products.length === 0 ? (
            <div className="empty">No products yet. Add your first product below.</div>
          ) : (
            <div className="product-table">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id}>
                      <td>{p.name}</td>
                      <td>{p.category}</td>
                      <td>₹{(p.pricePaise / 100).toFixed(2)}</td>
                      <td className={`stock-cell ${p.stock === 0 ? "out" : p.stock <= 5 ? "low" : "ok"}`}>
                        {p.stock === 0 ? "Out of stock" : p.stock <= 5 ? `Low (${p.stock})` : p.stock}
                      </td>
                      <td>{p.active ? "Active" : "Inactive"}</td>
                      <td>
                        <button className="edit-btn" onClick={() => alert(`Edit ${p.name} coming soon`)}>Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="section">
          <div className="section-header">
            <h2>Recent Orders</h2>
          </div>
          {orders.length === 0 ? (
            <div className="empty">No orders yet.</div>
          ) : (
            <div className="order-list">
              {orders.map(o => (
                <div key={o.id} className="order-card">
                  <div className="order-header">
                    <span className="order-id">Order {o.id.slice(-6)}</span>
                    <span className="order-status">{o.status}</span>
                  </div>
                  <div className="order-items">
                    {o.items.map(i => (
                      <div key={i.id} className="order-item">
                        <span>{i.quantity} × {i.productName}</span>
                        <span>₹{(i.unitPricePaise / 100).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="order-total">
                    <span>Total:</span>
                    <strong>₹{(o.totalPaise / 100).toFixed(2)}</strong>
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

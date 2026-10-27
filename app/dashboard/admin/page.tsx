import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import DashboardLayout from "@/app/dashboard/layout";

export default async function AdminDashboardPage() {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    // Layout middleware handles redirect
  }

  const farmers = await db.farmer.findMany({
    include: { user: true, products: true, _count: { select: { products: true } } },
    orderBy: { createdAt: "desc" },
  });

  const orders = await db.order.findMany({
    include: { items: true, user: true },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  const totalProducts = farmers.reduce((sum, f) => sum + f.products.length, 0);
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalPaise, 0);
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

        <div className="section">
          <div className="section-header">
            <h2>Farmers</h2>
            <span className="badge">{unverifiedFarmers} unverified</span>
          </div>
          <div className="farmer-table">
            <table>
              <thead>
                <tr>
                  <th>Farm</th>
                  <th>Farmer</th>
                  <th>Location</th>
                  <th>Products</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {farmers.map(f => (
                  <tr key={f.id}>
                    <td>{f.farmName}</td>
                    <td>{f.name}</td>
                    <td>{f.location}</td>
                    <td>{f.products.length}</td>
                    <td>
                      <span className={`status-badge ${f.verified ? "verified" : "pending"}`}>
                        {f.verified ? "Verified" : "Pending"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="section">
          <div className="section-header">
            <h2>All Orders</h2>
          </div>
          <div className="order-list">
            {orders.map(o => (
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
        </div>
      </div>
    </DashboardLayout>
  );
}

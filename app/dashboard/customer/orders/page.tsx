"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Menu,
  X,
  LogOut,
  Package,
  Clock,
  PackageCheck,
  PackageMinus,
  Truck,
  HelpCircle,
} from "../../../components/Icons";

type Order = { id: string; customerName: string; email: string; status: string; totalPaise: number; items: any[]; createdAt: string };

const STATUS_ICONS: Record<string, any> = {
  PENDING_PAYMENT: Clock,
  CONFIRMED: PackageCheck,
  PREPARING: Truck,
  READY_FOR_PICKUP: Truck,
  OUT_FOR_DELIVERY: Truck,
  DELIVERED: PackageCheck,
  CANCELLED: PackageMinus,
};

const NAV_ITEMS = [
  { name: "Orders", href: "/dashboard/customer/orders", icon: Package },
];

export default function CustomerOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/orders", { credentials: "include" });
        if (!res.ok) throw new Error("Failed to load orders.");
        const data = await res.json();
        setOrders(data);
      } catch (err: any) {
        setError(err?.message || "Failed to load orders.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING_PAYMENT: "Pending Payment",
      CONFIRMED: "Confirmed",
      PREPARING: "Preparing",
      READY_FOR_PICKUP: "Ready for Pickup",
      OUT_FOR_DELIVERY: "Out for Delivery",
      DELIVERED: "Delivered",
      CANCELLED: "Cancelled",
    };
    return labels[status] || status;
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <h1>Loading orders...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "#8a1f1f" }}>
        <h1>{error}</h1>
        <a href="/auth/signin" style={{ color: "#294b35", textDecoration: "underline" }}>
          Sign in here
        </a>
      </div>
    );
  }

  return (
    <div className="dashboard-shell" style={{ display: "flex", minHeight: "100vh" }}>
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
          transition: "transform 0.25s",
        }}
      >
        <div className="sidebar-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid #e5e6dc" }}>
          <div className="brand" style={{ fontWeight: "700", color: "#294b35", fontSize: "16px" }}>Customer Hub</div>
          <button className="close-btn" onClick={() => {}} style={{ background: "none", border: "none", color: "#7c8275", cursor: "pointer", padding: 4 }}>
            <X />
          </button>
        </div>
        <nav style={{ padding: "16px 0", flex: 1, overflowY: "auto" }}>
          {NAV_ITEMS.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className={`nav-item ${item.name === "Orders" ? "active" : ""}`}
              onClick={() => {}}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 20px",
                fontSize: 13,
                color: item.name === "Orders" ? "#294b35" : "#7c8275",
                textDecoration: "none",
                background: item.name === "Orders" ? "#294b35" : "transparent",
              }}
            >
              <item.icon />
              {item.name}
            </a>
          ))}
        </nav>
        <div className="sidebar-footer" style={{ padding: "16px 20px", borderTop: "1px solid #e5e6dc", display: "flex", flexDirection: "column", gap: 12 }}>
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
            <HelpCircle /> Sign out
          </button>
        </div>
      </aside>

      <div className="dashboard-main" style={{ marginLeft: "260px", flex: 1, overflowY: "auto" }}>
        <header className="dashboard-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", borderBottom: "1px solid #e5e6dc", background: "#fff" }}>
          <div className="title" style={{ fontWeight: "700", fontSize: "16px", color: "#29352a" }}>
            My Orders
          </div>
        </header>
        <main className="dashboard-content" style={{ padding: 24 }}>
          <div className="page">
            <div className="page-header" style={{ marginBottom: 24 }}>
              <h1 style={{ fontSize: "20px", fontWeight: "700", color: "#203c2b", marginTop: 0 }}>
                My Orders
              </h1>
              <p style={{ fontSize: "13px", color: "#7c8275", marginTop: 4 }}>
                Track your orders and deliveries
              </p>
            </div>

            {error && (
              <div className="error" style={{ background: "#fdecea", color: "#8a1f1f", padding: "10px 14px", borderRadius: 4, border: "1px solid #f5c6c7", marginBottom: 20 }}>
                {error}
              </div>
            )}

            <div className="section" style={{ background: "#fff", border: "1px solid #e5e6dc", borderRadius: 8, padding: 20 }}>
              {orders.length === 0 ? (
                <div className="empty" style={{ textAlign: "center", padding: 48, color: "#7c8275", fontSize: 13 }}>
                  <HelpCircle style={{ width: 48, height: 48, marginBottom: 16 }} />
                  <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#203c2b", marginBottom: 8 }}>
                    No orders yet
                  </h2>
                  <p style={{ marginBottom: 16 }}>
                    Start shopping to see your orders here.
                  </p>
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
                          {handleStatusLabel(o.status)}
                        </span>
                      </div>
                      <div className="order-date" style={{ fontSize: 12, color: "#7c8275", marginBottom: 12 }}>
                        {formatDate(o.createdAt)}
                      </div>
                      <div className="order-items">
                        {o.items.map((i: any) => (
                          <div key={i.id} className="order-item" style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#29352a", marginBottom: 4 }}>
                            <span>{i.quantity} × {i.productName}</span>
                            <span>₹{(i.unitPricePaise / 100).toFixed(2)}</span>
                          </div>
                        ))}
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

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Menu,
  X,
  LogOut,
  ShoppingBasket,
  Package,
  Truck,
  HelpCircle,
  Image as ImageIcon,
  Plus,
  Minus,
} from "../../components/Icons";

type Product = { id: string; name: string; description: string; category: string; pricePaise: number; unit: string; image: string; stock: number; featured: boolean; active: boolean; farmerId: string; farmerName: string };

const NAV_ITEMS = [
  { name: "Home", href: "/", icon: LayoutDashboard },
];

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/admin/products/${params.id}`, { credentials: "include" });
        if (!res.ok) throw new Error("Product not found.");
        const data = await res.json();
        setProduct(data);
      } catch (err: any) {
        setError(err?.message || "Failed to load product.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <h1>Loading product...</h1>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "#8a1f1f" }}>
        <h1>{error || "Product not found"}</h1>
        <a href="/" style={{ color: "#294b35", textDecoration: "underline" }}>
          Back to store
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
          transform: "translateX(0)",
        }}
      >
        <div className="sidebar-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid #e5e6dc" }}>
          <div className="brand" style={{ fontWeight: "700", color: "#294b35", fontSize: "16px" }}>Harvest Market</div>
        </div>
        <nav style={{ padding: "16px 0", flex: 1, overflowY: "auto" }}>
          {NAV_ITEMS.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className={`nav-item ${item.name === "Home" ? "active" : ""}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 20px",
                fontSize: 13,
                color: item.name === "Home" ? "#294b35" : "#7c8275",
                textDecoration: "none",
                background: item.name === "Home" ? "#294b35" : "transparent",
              }}
            >
              <item.icon />
              {item.name}
            </a>
          ))}
        </nav>
      </aside>

      <div className="dashboard-main" style={{ marginLeft: "260px", flex: 1, overflowY: "auto" }}>
        <header className="dashboard-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", borderBottom: "1px solid #e5e6dc", background: "#fff" }}>
          <div className="title" style={{ fontWeight: "700", fontSize: "16px", color: "#29352a" }}>
            Product Details
          </div>
        </header>
        <main className="dashboard-content" style={{ padding: 24 }}>
          <div className="page">
            <div className="product-detail" style={{ maxWidth: 800, margin: "0 auto" }}>
              <div className="product-image" style={{ width: "100%", height: 300, background: "#f5f2e6", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                <ImageIcon style={{ width: 80, height: 80, color: "#7c8275" }} />
              </div>
              <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#203c2b", marginBottom: 8 }}>{product.name}</h1>
              <p style={{ color: "#7c8275", marginBottom: 16 }}>{product.description}</p>
              <div className="product-meta" style={{ display: "flex", gap: 20, marginBottom: 20 }}>
                <div className="meta-item">
                  <span style={{ display: "block", fontSize: 12, fontWeight: "700", color: "#7c8275", textTransform: "uppercase", letterSpacing: "0.5px" }}>Price</span>
                  <span style={{ fontSize: "20px", fontWeight: "700", color: "#294b35" }}>₹{(product.pricePaise / 100).toFixed(2)}</span>
                </div>
                <div className="meta-item">
                  <span style={{ display: "block", fontSize: 12, fontWeight: "700", color: "#7c8275", textTransform: "uppercase", letterSpacing: "0.5px" }}>Unit</span>
                  <span style={{ fontSize: 16, color: "#29352a" }}>{product.unit}</span>
                </div>
                <div className="meta-item">
                  <span style={{ display: "block", fontSize: 12, fontWeight: "700", color: "#7c8275", textTransform: "uppercase", letterSpacing: "0.5px" }}>Category</span>
                  <span style={{ fontSize: 16, color: "#29352a" }}>{product.category}</span>
                </div>
                <div className="meta-item">
                  <span style={{ display: "block", fontSize: 12, fontWeight: "700", color: "#7c8275", textTransform: "uppercase", letterSpacing: "0.5px" }}>Farmer</span>
                  <span style={{ fontSize: 16, color: "#29352a" }}>{product.farmerName}</span>
                </div>
              </div>
              <div className="stock-status" style={{ marginBottom: 20 }}>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color: product.stock === 0 ? "#8a1f1f" : product.stock <= 5 ? "#d88b52" : "#2e7d32",
                  }}
                >
                  {product.stock === 0 ? "Out of Stock" : product.stock <= 5 ? `Low Stock (${product.stock} ${product.unit})` : `In Stock (${product.stock} ${product.unit})`}
                </span>
              </div>
              {product.stock > 0 && (
                <div className="quantity-selector" style={{ marginBottom: 20 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: "600", color: "#29352a", marginBottom: 8 }}>Quantity</label>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      style={{
                        background: "#fff",
                        border: "1px solid #e5e6dc",
                        borderRadius: 4,
                        width: 36,
                        height: 36,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: quantity <= 1 ? "not-allowed" : "pointer",
                        color: quantity <= 1 ? "#7c8275" : "#294b35",
                      }}
                    >
                      <Minus />
                    </button>
                    <span style={{ fontSize: 16, fontWeight: "700", minWidth: 30, textAlign: "center" }}>{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      disabled={quantity >= product.stock}
                      style={{
                        background: "#fff",
                        border: "1px solid #e5e6dc",
                        borderRadius: 4,
                        width: 36,
                        height: 36,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: quantity >= product.stock ? "not-allowed" : "pointer",
                        color: quantity >= product.stock ? "#7c8275" : "#294b35",
                      }}
                    >
                      <Plus />
                    </button>
                  </div>
                </div>
              )}
              <div className="buy-section" style={{ marginBottom: 20 }}>
                <button
                  onClick={() => {
                    router.push(`/api/auth/signin?callbackUrl=${encodeURIComponent(`/product/${product.id}?addToBasket=${product.id}&qty=${quantity}`)}`);
                  }}
                  disabled={product.stock === 0 || quantity === 0}
                  style={{
                    background: product.stock === 0 ? "#7c8275" : "#294b35",
                    color: "#fff",
                    border: "none",
                    borderRadius: 4,
                    padding: "12px 24px",
                    fontSize: 14,
                    fontWeight: "600",
                    cursor: product.stock === 0 || quantity === 0 ? "not-allowed" : "pointer",
                    width: "100%",
                  }}
                >
                  {product.stock === 0 ? "Out of Stock" : "Add to Basket"}
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

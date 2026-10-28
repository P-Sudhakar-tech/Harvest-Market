"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Menu,
  X,
  LogOut,
  User,
  Mail,
  Phone,
  MapPin,
  Package,
} from "../../../components/Icons";

const NAV_ITEMS = [
  { name: "Profile", href: "/dashboard/customer/profile", icon: User },
  { name: "Orders", href: "/dashboard/customer/orders", icon: Package },
];

export default function CustomerProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; name: string | null; email: string; phone: string | null; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
        setUser(u);
      } catch (err) {
        setError("Failed to load session. Please try again.");
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <h1>Loading profile...</h1>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "#8a1f1f" }}>
        <h1>{error || "Not authenticated"}</h1>
        <p>Please sign in to access your profile.</p>
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
          transform: sidebarOpen ? "translateX(0)" : "translateX(0)",
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
              className={`nav-item ${item.name === "Profile" ? "active" : ""}`}
              onClick={() => {}}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 20px",
                fontSize: 13,
                color: item.name === "Profile" ? "#294b35" : "#7c8275",
                textDecoration: "none",
                background: item.name === "Profile" ? "#294b35" : "transparent",
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
            <LogOut /> Sign out
          </button>
        </div>
      </aside>

      <div className="dashboard-main" style={{ marginLeft: "260px", flex: 1, overflowY: "auto" }}>
        <header className="dashboard-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", borderBottom: "1px solid #e5e6dc", background: "#fff" }}>
          <div className="title" style={{ fontWeight: "700", fontSize: "16px", color: "#29352a" }}>
            My Profile
          </div>
        </header>
        <main className="dashboard-content" style={{ padding: 24 }}>
          <div className="page">
            <div className="page-header" style={{ marginBottom: 24 }}>
              <h1 style={{ fontSize: "20px", fontWeight: "700", color: "#203c2b", marginTop: 0 }}>
                My Profile
              </h1>
              <p style={{ fontSize: "13px", color: "#7c8275", marginTop: 4 }}>
                Manage your account information
              </p>
            </div>

            <div className="section" style={{ background: "#fff", border: "1px solid #e5e6dc", borderRadius: 8, padding: 20 }}>
              <div className="section-header" style={{ marginBottom: 16 }}>
                <h2 style={{ fontSize: "16px", fontWeight: "700", color: "#203c2b", margin: 0 }}>
                  Account Information
                </h2>
              </div>
              <div className="field" style={{ marginBottom: 16 }}>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "#29352a", display: "block", marginBottom: 6 }}>Full Name</label>
                <span style={{ fontSize: 14, color: "#7c8275" }}>{user.name || "—"}</span>
              </div>
              <div className="field" style={{ marginBottom: 16 }}>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "#29352a", display: "block", marginBottom: 6 }}>Email Address</label>
                <span style={{ fontSize: 14, color: "#7c8275" }}>{user.email}</span>
              </div>
              <div className="field" style={{ marginBottom: 16 }}>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "#29352a", display: "block", marginBottom: 6 }}>Mobile Number</label>
                <span style={{ fontSize: 14, color: "#7c8275" }}>{user.phone || "Not provided"}</span>
              </div>
              <div className="field" style={{ marginBottom: 16 }}>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "#29352a", display: "block", marginBottom: 6 }}>Role</label>
                <span style={{ fontSize: 12, fontWeight: "700", color: "#294b35", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  {user.role.toLowerCase()}
                </span>
              </div>
              <div className="field" style={{ marginBottom: 16 }}>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "#29352a", display: "block", marginBottom: 6 }}>Customer ID</label>
                <span style={{ fontSize: 14, color: "#7c8275" }}>{user.id.slice(-8)}</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

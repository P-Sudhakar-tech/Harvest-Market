"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { LayoutDashboard, ShieldCheck, Users, LogOut, Package, ShoppingBasket, Menu, X } from "lucide-react";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Products", href: "/dashboard/products", icon: Package },
  { name: "Orders", href: "/dashboard/orders", icon: ShoppingBasket },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ id: string; name: string | null; email: string; role: string } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const u = await res.json();
          setUser({ id: u.id, name: u.name, email: u.email, role: u.role });
        } else {
          router.push("/auth/signin");
        }
      } catch {
        router.push("/auth/signin");
      }
    })();
  }, [router]);

  if (!user) return null;

  const isAdmin = user.role === "ADMIN";
  const isFarmer = user.role === "FARMER";
  const activeNav = NAV_ITEMS.find(n => pathname === n.href);

  return (
    <div className="dashboard-shell">
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="brand">{isAdmin ? "Admin" : "Farmer"} Hub</div>
          <button className="close-btn" onClick={() => setSidebarOpen(false)}><X size={20} /></button>
        </div>
        <nav>
          {NAV_ITEMS.map(item => (
            <a key={item.name} href={item.href} className={activeNav?.name === item.name ? "nav-item active" : "nav-item"} onClick={() => setSidebarOpen(false)}>
              <item.icon size={18} />
              {item.name}
            </a>
          ))}
          {isAdmin && (
            <a href="/dashboard/admin" className={`nav-item ${pathname.startsWith("/dashboard/admin") ? "active" : ""}`} onClick={() => setSidebarOpen(false)}>
              <Users size={18} />
              Admin
            </a>
          )}
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-name">{user.name || user.email}</div>
            <div className="user-role">{user.role}</div>
          </div>
          <button className="signout-btn" onClick={() => { fetch("/api/auth/signout", { method: "POST" }).then(() => router.push("/")); }}>
            <LogOut size={18} /> Sign out
          </button>
        </div>
      </aside>
      <div className="dashboard-main">
        <header className="dashboard-header">
          <button className="menu-btn" onClick={() => setSidebarOpen(true)}><Menu size={22} /></button>
          <div className="title">{activeNav?.name || "Dashboard"}</div>
        </header>
        <main className="dashboard-content">{children}</main>
      </div>
    </div>
  );
}

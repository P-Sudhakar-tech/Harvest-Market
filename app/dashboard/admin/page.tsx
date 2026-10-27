"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Users, LogOut, Package, ShoppingBasket, Menu, X, RefreshCw } from "lucide-react";

export default function AdminDashboardPage() {
  const [user, setUser] = useState<{ id: string; name: string | null; email: string; role: string } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        console.log("auth/me status:", res.status);
        if (!res.ok) {
          setError("Session expired. Status: " + res.status);
          return;
        }
        const u = await res.json();
        console.log("auth/me user:", u);
        setUser(u);
      } catch (err: any) {
        setError("Fetch error: " + err?.message);
      }
    })();
  }, []);

  if (error) {
    return (
      <div style={{ padding: 40, color: "#8a1f1f" }}>
        <h1>Error</h1>
        <p>{error}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ padding: 40 }}>
        <h1>Loading...</h1>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>Admin Dashboard</h1>
      <p>Hello {user.name}, role: {user.role}</p>
      <p>Content is rendering!</p>
    </div>
  );
}

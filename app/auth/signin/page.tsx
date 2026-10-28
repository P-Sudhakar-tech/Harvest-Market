"use client";

import { LogIn } from "lucide-react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function SigninPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sign in failed");
      const callbackUrl = new URLSearchParams(window.location.search).get("callbackUrl") || "/dashboard";
      router.push(callbackUrl);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream">
      <div className="wrap">
        <div className="auth-card">
          <div className="auth-header">
            <LogIn size={32} className="text-green" />
            <h1>Sign in</h1>
            <p>Welcome back to Harvest Market</p>
          </div>
          {error && <div className="error">{error}</div>}
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="field">
              <label>Email address</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="field">
              <label>Password</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <button type="submit" className="primary-button full-button" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
          <p className="auth-footer">Don't have an account? <a href="/auth/signup">Sign up</a></p>
        </div>
      </div>
    </div>
  );
}

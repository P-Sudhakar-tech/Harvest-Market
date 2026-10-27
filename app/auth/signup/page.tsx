"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("CUSTOMER");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sign up failed");
      router.push("/auth/signin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream">
      <div className="wrap">
        <div className="auth-card">
          <div className="auth-header">
            <UserPlus size={32} className="text-green" />
            <h1>Create account</h1>
            <p>Join Harvest Market as a customer or farmer</p>
          </div>
          {error && <div className="error">{error}</div>}
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="field">
              <label>Full name</label>
              <input type="text" required value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="field">
              <label>Email address</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="field">
              <label>Password</label>
              <input type="password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <div className="field">
              <label>Register as</label>
              <select value={role} onChange={e => setRole(e.target.value as "CUSTOMER" | "FARMER" | "ADMIN")}>
                <option value="CUSTOMER">Customer</option>
                <option value="FARMER">Farmer</option>
              </select>
            </div>
            <button type="submit" className="primary-button full-button" disabled={loading}>
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>
          <p className="auth-footer">Already have an account? <a href="/auth/signin">Sign in</a></p>
        </div>
      </div>
    </div>
  );
}

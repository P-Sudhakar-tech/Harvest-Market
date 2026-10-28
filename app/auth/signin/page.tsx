"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Menu, X } from "../../components/Icons";

export default function SigninPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

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

      if (!res.ok) {
        throw new Error(data.error || "Invalid email or password");
      }

      const callbackUrl =
        new URLSearchParams(window.location.search).get("callbackUrl") ||
        "/dashboard";
      router.push(callbackUrl);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="wrap">
          <div className="auth-card">
            <div className="auth-header">
              <div className="loading-spinner" />
              <h1>Signing in...</h1>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream">
      <div className="wrap">
        <div className="auth-card">
          <div className="auth-header">
            <div className="brand-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#294b35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                <polyline points="2 19 12 22 22 19"></polyline>
                <polyline points="2 12 12 15 22 12"></polyline>
              </svg>
            </div>
            <h1>Welcome back</h1>
            <p>Sign in to your Harvest Market account</p>
          </div>

          {error && (
            <div className="error">
              <span style={{ fontSize: "11px", fontWeight: "700" }}>Error</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="field">
              <label>Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            <div className="field">
              <label>Password</label>
              <div className="password-input">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c8275" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.11a9.9 9.9 0 0 1 0 14.17A10.07 10.07 0 0 1 12 20c7 0 11-8 11-8a18.45 18.45 0 0 1-5.06 5.94"></path>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c8275" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="field remember-me">
              <input
                type="checkbox"
                id="remember-me"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
              />
              <label htmlFor="remember-me">Remember me</label>
            </div>

            <button
              type="submit"
              className="primary-button full-button"
              disabled={loading || !email || !password}
            >
              {loading ? (
                <>
                  <span style={{ display: "inline-block", width: 16, height: 16, borderRadius: "50%", border: "2px solid #fff", borderTop: "2px solid #294b35", animation: "spin 1s linear infinite" }} />
                  <span style={{ marginLeft: 8, fontSize: 14 }}>Signing in...</span>
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <p className="auth-footer">
            Don't have an account?{" "}
            <a href="/auth/signup" style={{ color: "#294b35", fontWeight: "600", textDecoration: "underline" }}>
              Create account
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

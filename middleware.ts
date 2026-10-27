import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth";

const DASHBOARD_ROUTES = ["/dashboard"];
const ADMIN_ROUTES = ["/dashboard/admin"];
const FARMER_ROUTES = ["/dashboard/farmer"];

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 60;
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function rateLimit(ip: string) {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1 };
  }
  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, remaining: 0 };
  }
  entry.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - entry.count };
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rate limiting for API routes
  if (pathname.startsWith("/api/")) {
    const ip = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "unknown";
    const limit = rateLimit(ip);
    if (!limit.allowed) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }
    const response = NextResponse.next();
    response.headers.set("X-RateLimit-Remaining", String(limit.remaining));
    return response;
  }

  // Security headers for all responses
  const response = NextResponse.next();
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  if (DASHBOARD_ROUTES.some(prefix => pathname.startsWith(prefix)) || pathname === "/dashboard") {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.redirect(new URL("/auth/signin?callbackUrl=" + encodeURIComponent(pathname), request.url));
    }
  }

  if (ADMIN_ROUTES.some(prefix => pathname.startsWith(prefix))) {
    const user = await getSessionUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/auth/signin?callbackUrl=" + encodeURIComponent(pathname), request.url));
    }
  }

  if (FARMER_ROUTES.some(prefix => pathname.startsWith(prefix))) {
    const user = await getSessionUser();
    if (!user || (user.role !== "FARMER" && user.role !== "ADMIN")) {
      return NextResponse.redirect(new URL("/auth/signin?callbackUrl=" + encodeURIComponent(pathname), request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"],
};

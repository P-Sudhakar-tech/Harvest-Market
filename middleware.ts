import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionUser } from "./lib/auth";

const DASHBOARD_ROUTES = ["/dashboard"];
const ADMIN_ROUTES = ["/dashboard/admin"];
const FARMER_ROUTES = ["/dashboard/farmer"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const user = await getSessionUser();

  if (DASHBOARD_ROUTES.some(prefix => pathname.startsWith(prefix)) || pathname === "/dashboard") {
    if (!user) {
      return NextResponse.redirect(new URL("/auth/signin?callbackUrl=" + encodeURIComponent(pathname), request.url));
    }
  }

  if (ADMIN_ROUTES.some(prefix => pathname.startsWith(prefix))) {
    if (!user || user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/auth/signin?callbackUrl=" + encodeURIComponent(pathname), request.url));
    }
  }

  if (FARMER_ROUTES.some(prefix => pathname.startsWith(prefix))) {
    if (!user || (user.role !== "FARMER" && user.role !== "ADMIN")) {
      return NextResponse.redirect(new URL("/auth/signin?callbackUrl=" + encodeURIComponent(pathname), request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};

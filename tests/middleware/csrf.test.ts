import { NextRequest } from "next/server";
import { middleware } from "@/middleware";
import { generateCsrfToken } from "@/lib/validation";

let ipCounter = 0;
function uniqueIp() {
  ipCounter += 1;
  return `10.0.0.${ipCounter}`;
}

function req(method: string, path: string, opts: { cookie?: string; csrfHeader?: string; ip?: string } = {}) {
  const headers: Record<string, string> = { "x-forwarded-for": opts.ip ?? uniqueIp() };
  if (opts.cookie) headers["cookie"] = opts.cookie;
  if (opts.csrfHeader !== undefined) headers["x-csrf-token"] = opts.csrfHeader;
  return new NextRequest(new URL(`http://localhost${path}`), { method, headers });
}

describe("middleware CSRF enforcement", () => {
  it("allows safe methods (GET) through without a csrf token", async () => {
    const res = await middleware(req("GET", "/api/products"));
    expect(res.status).not.toBe(403);
  });

  it("allows a guest (no session cookie) mutating request through without a csrf token", async () => {
    const res = await middleware(req("POST", "/api/orders"));
    expect(res.status).not.toBe(403);
  });

  it("blocks an authenticated mutating request with no csrf header", async () => {
    const res = await middleware(req("POST", "/api/auth/signout", { cookie: "hm_session=sometoken; hm_csrf=abc123" }));
    expect(res.status).toBe(403);
  });

  it("blocks an authenticated mutating request when the csrf header doesn't match the cookie", async () => {
    const res = await middleware(
      req("POST", "/api/admin/products", { cookie: "hm_session=sometoken; hm_csrf=abc123", csrfHeader: "not-abc123" })
    );
    expect(res.status).toBe(403);
  });

  it("allows an authenticated mutating request when the csrf header matches the cookie", async () => {
    const token = generateCsrfToken();
    const res = await middleware(
      req("POST", "/api/admin/products", { cookie: `hm_session=sometoken; hm_csrf=${token}`, csrfHeader: token })
    );
    expect(res.status).not.toBe(403);
  });

  it.each(["/api/auth/signin", "/api/auth/signup", "/api/payments/webhook"])(
    "exempts %s from the csrf check even with a session cookie and no token",
    async (path) => {
      const res = await middleware(req("POST", path, { cookie: "hm_session=sometoken; hm_csrf=abc123" }));
      expect(res.status).not.toBe(403);
    }
  );

  it("rate-limits a single IP after too many requests in the window", async () => {
    const ip = uniqueIp();
    let lastStatus = 200;
    for (let i = 0; i < 61; i++) {
      const res = await middleware(req("GET", "/api/products", { ip }));
      lastStatus = res.status;
    }
    expect(lastStatus).toBe(429);
  });
});

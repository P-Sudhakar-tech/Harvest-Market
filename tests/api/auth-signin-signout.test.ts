import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { POST as signin } from "@/app/api/auth/signin/route";
import { POST as signout } from "@/app/api/auth/signout/route";
import { GET as me } from "@/app/api/auth/me/route";
import { __setMockCookie, __clearMockCookies } from "../mocks/next-headers";
import { resetDb } from "../helpers/db";
import { jsonRequest, parseSetCookies } from "../helpers/request";

beforeEach(async () => {
  __clearMockCookies();
  await resetDb();
});

afterAll(async () => {
  await db.$disconnect();
});

async function makeUser() {
  const email = "signin-test@test.com";
  await db.user.create({
    data: {
      name: "Signin Test",
      email,
      phone: "9123456789",
      passwordHash: await hashPassword("password123"),
      role: "CUSTOMER",
    },
  });
  return email;
}

describe("POST /api/auth/signin", () => {
  it("rejects an unknown email", async () => {
    const res = await signin(jsonRequest("http://localhost/api/auth/signin", { email: "nope@test.com", password: "whatever" }));
    expect(res.status).toBe(401);
  });

  it("rejects a wrong password", async () => {
    const email = await makeUser();
    const res = await signin(jsonRequest("http://localhost/api/auth/signin", { email, password: "wrong-password" }));
    expect(res.status).toBe(401);
  });

  it("sets an httpOnly session cookie and a readable csrf cookie on success", async () => {
    const email = await makeUser();
    const res = await signin(jsonRequest("http://localhost/api/auth/signin", { email, password: "password123" }));
    expect(res.status).toBe(200);

    const setCookieHeaders = res.headers.getSetCookie ? res.headers.getSetCookie() : [];
    const sessionLine = setCookieHeaders.find(c => c.startsWith("hm_session="));
    const csrfLine = setCookieHeaders.find(c => c.startsWith("hm_csrf="));

    expect(sessionLine).toBeDefined();
    expect(sessionLine).toMatch(/HttpOnly/i);
    expect(csrfLine).toBeDefined();
    expect(csrfLine).not.toMatch(/HttpOnly/i);

    const body = await res.json();
    expect(body.email).toBe(email);

    // A session row should now exist in the db.
    const sessionCount = await db.session.count();
    expect(sessionCount).toBe(1);
  });

  it("rejects malformed JSON gracefully instead of crashing", async () => {
    const req = new Request("http://localhost/api/auth/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{not json",
    });
    const res = await signin(req);
    expect(res.status).toBe(400);
  });
});

describe("POST /api/auth/signout + GET /api/auth/me", () => {
  it("me returns 401 when there is no session", async () => {
    const res = await me();
    expect(res.status).toBe(401);
  });

  it("me returns the user when a valid session cookie is present", async () => {
    const email = await makeUser();
    const signinRes = await signin(jsonRequest("http://localhost/api/auth/signin", { email, password: "password123" }));
    const cookies = parseSetCookies(signinRes);
    __setMockCookie("hm_session", cookies["hm_session"]);

    const res = await me();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.email).toBe(email);
  });

  it("signout deletes the session so a later me() call is unauthenticated", async () => {
    const email = await makeUser();
    const signinRes = await signin(jsonRequest("http://localhost/api/auth/signin", { email, password: "password123" }));
    const cookies = parseSetCookies(signinRes);
    __setMockCookie("hm_session", cookies["hm_session"]);

    await signout();
    expect(await db.session.count()).toBe(0);

    const res = await me();
    expect(res.status).toBe(401);
  });
});

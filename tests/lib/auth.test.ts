import { db } from "@/lib/db";
import {
  hashPassword,
  comparePassword,
  createSession,
  getSessionUser,
  destroySession,
  requireRole,
} from "@/lib/auth";
import { __setMockCookie, __clearMockCookies } from "../mocks/next-headers";
import { resetDb } from "../helpers/db";

beforeEach(async () => {
  __clearMockCookies();
  await resetDb();
});

afterAll(async () => {
  await db.$disconnect();
});

async function makeUser(role: "CUSTOMER" | "FARMER" | "ADMIN" = "CUSTOMER") {
  return db.user.create({
    data: {
      name: "Test User",
      email: `${role.toLowerCase()}-${Math.random().toString(36).slice(2)}@test.com`,
      phone: `9${Math.floor(Math.random() * 1_000_000_000)}`,
      passwordHash: await hashPassword("password123"),
      role,
    },
  });
}

describe("password hashing", () => {
  it("verifies a matching password", async () => {
    const hashed = await hashPassword("correct-password");
    expect(await comparePassword("correct-password", hashed)).toBe(true);
  });

  it("rejects a non-matching password", async () => {
    const hashed = await hashPassword("correct-password");
    expect(await comparePassword("wrong-password", hashed)).toBe(false);
  });

  it("never stores the password in plaintext", async () => {
    const hashed = await hashPassword("correct-password");
    expect(hashed).not.toBe("correct-password");
  });
});

describe("session lifecycle", () => {
  it("returns null when no session cookie is present", async () => {
    expect(await getSessionUser()).toBeNull();
  });

  it("returns the user for a valid session cookie", async () => {
    const user = await makeUser();
    const { token } = await createSession(user.id);
    __setMockCookie("hm_session", token);

    const sessionUser = await getSessionUser();
    expect(sessionUser?.id).toBe(user.id);
    expect(sessionUser?.email).toBe(user.email);
  });

  it("returns null and deletes the row for an expired session", async () => {
    const user = await makeUser();
    const { token } = await createSession(user.id);
    await db.session.update({
      where: { token },
      data: { expiresAt: new Date(Date.now() - 1000) },
    });
    __setMockCookie("hm_session", token);

    expect(await getSessionUser()).toBeNull();
    expect(await db.session.findUnique({ where: { token } })).toBeNull();
  });

  it("returns null for a garbage/unknown token", async () => {
    __setMockCookie("hm_session", "this-token-does-not-exist");
    expect(await getSessionUser()).toBeNull();
  });

  it("destroySession removes the session row and the cookie", async () => {
    const user = await makeUser();
    const { token } = await createSession(user.id);
    __setMockCookie("hm_session", token);

    await destroySession();

    expect(await db.session.findUnique({ where: { token } })).toBeNull();
    expect(await getSessionUser()).toBeNull();
  });
});

describe("requireRole", () => {
  it("rejects with 401 when there is no session", async () => {
    const result = await requireRole(["ADMIN"]);
    expect(result).toMatchObject({ user: null, error: "Not authenticated", status: 401 });
  });

  it("rejects with 403 when the user's role isn't allowed", async () => {
    const user = await makeUser("CUSTOMER");
    const { token } = await createSession(user.id);
    __setMockCookie("hm_session", token);

    const result = await requireRole(["ADMIN", "FARMER"]);
    expect(result.status).toBe(403);
    expect(result.error).toBe("Forbidden");
  });

  it("allows access when the user's role is permitted", async () => {
    const user = await makeUser("ADMIN");
    const { token } = await createSession(user.id);
    __setMockCookie("hm_session", token);

    const result = await requireRole(["ADMIN", "FARMER"]);
    expect(result.status).toBe(200);
    expect(result.error).toBeNull();
    expect(result.user?.id).toBe(user.id);
  });
});

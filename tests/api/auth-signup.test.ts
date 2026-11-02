import { db } from "@/lib/db";
import { POST as signup } from "@/app/api/auth/signup/route";
import { resetDb } from "../helpers/db";
import { jsonRequest } from "../helpers/request";

beforeEach(async () => {
  await resetDb();
});

afterAll(async () => {
  await db.$disconnect();
});

describe("POST /api/auth/signup", () => {
  // Regression test: lib/validation.ts used to let the client pick role:"ADMIN"
  // on self-signup, which was a straight privilege-escalation bug. Never allow
  // this to come back.
  it("rejects role: ADMIN and does not create an admin account", async () => {
    const res = await signup(
      jsonRequest("http://localhost/api/auth/signup", {
        name: "Attacker",
        email: "attacker@test.com",
        phone: "9000000001",
        password: "password123",
        role: "ADMIN",
      })
    );
    expect(res.status).toBe(400);
    expect(await db.user.findUnique({ where: { email: "attacker@test.com" } })).toBeNull();
  });

  it("allows self-signup as CUSTOMER", async () => {
    const res = await signup(
      jsonRequest("http://localhost/api/auth/signup", {
        name: "Normal Customer",
        email: "customer@test.com",
        phone: "9000000002",
        password: "password123",
        role: "CUSTOMER",
      })
    );
    expect(res.status).toBe(201);
    const user = await db.user.findUnique({ where: { email: "customer@test.com" } });
    expect(user?.role).toBe("CUSTOMER");
  });

  it("allows self-signup as FARMER", async () => {
    const res = await signup(
      jsonRequest("http://localhost/api/auth/signup", {
        name: "Normal Farmer",
        email: "farmer@test.com",
        phone: "9000000003",
        password: "password123",
        role: "FARMER",
      })
    );
    expect(res.status).toBe(201);
    const user = await db.user.findUnique({ where: { email: "farmer@test.com" } });
    expect(user?.role).toBe("FARMER");
  });

  it("defaults to CUSTOMER when role is omitted", async () => {
    const res = await signup(
      jsonRequest("http://localhost/api/auth/signup", {
        name: "Default Role",
        email: "default-role@test.com",
        phone: "9000000004",
        password: "password123",
      })
    );
    expect(res.status).toBe(201);
    const user = await db.user.findUnique({ where: { email: "default-role@test.com" } });
    expect(user?.role).toBe("CUSTOMER");
  });

  it("rejects a duplicate email", async () => {
    await signup(
      jsonRequest("http://localhost/api/auth/signup", {
        name: "First", email: "dup@test.com", phone: "9000000005", password: "password123", role: "CUSTOMER",
      })
    );
    const res = await signup(
      jsonRequest("http://localhost/api/auth/signup", {
        name: "Second", email: "dup@test.com", phone: "9000000006", password: "password123", role: "CUSTOMER",
      })
    );
    expect(res.status).toBe(409);
  });

  it("rejects a duplicate phone number", async () => {
    await signup(
      jsonRequest("http://localhost/api/auth/signup", {
        name: "First", email: "uniquea@test.com", phone: "9000000007", password: "password123", role: "CUSTOMER",
      })
    );
    const res = await signup(
      jsonRequest("http://localhost/api/auth/signup", {
        name: "Second", email: "uniqueb@test.com", phone: "9000000007", password: "password123", role: "CUSTOMER",
      })
    );
    expect(res.status).toBe(409);
  });

  it("never stores the password in plaintext", async () => {
    await signup(
      jsonRequest("http://localhost/api/auth/signup", {
        name: "Hash Check", email: "hashcheck@test.com", phone: "9000000008", password: "password123", role: "CUSTOMER",
      })
    );
    const user = await db.user.findUnique({ where: { email: "hashcheck@test.com" } });
    expect(user?.passwordHash).not.toBe("password123");
  });

  it("rejects a too-short password", async () => {
    const res = await signup(
      jsonRequest("http://localhost/api/auth/signup", {
        name: "Short Pw", email: "shortpw@test.com", phone: "9000000009", password: "short", role: "CUSTOMER",
      })
    );
    expect(res.status).toBe(400);
  });
});

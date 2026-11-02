import { db } from "@/lib/db";
import { hashPassword, createSession } from "@/lib/auth";
import { POST as createOrder, GET as listOrders } from "@/app/api/orders/route";
import { GET as getOrder, PATCH as patchOrder } from "@/app/api/orders/[id]/route";
import { POST as payOrder } from "@/app/api/orders/[id]/pay/route";
import { __setMockCookie, __clearMockCookies } from "../mocks/next-headers";
import { resetDb } from "../helpers/db";
import { jsonRequest } from "../helpers/request";

beforeEach(async () => {
  __clearMockCookies();
  await resetDb();
});

afterAll(async () => {
  await db.$disconnect();
});

async function seedCatalog() {
  const farmer = await db.farmer.create({
    data: { name: "F", farmName: "Farm", location: "City", description: "d", verified: true },
  });
  const product = await db.product.create({
    data: { name: "Tomatoes", description: "d", category: "Vegetables", pricePaise: 500, stock: 5, image: "https://example.com/tomato.jpg", farmerId: farmer.id, active: true },
  });
  await db.serviceablePincode.create({ data: { pincode: "500001", deliveryFeePaise: 2000, active: true } });
  return { farmer, product };
}

function orderBody(productId: string, quantity: number, overrides: Record<string, unknown> = {}) {
  return {
    customerName: "Jane Doe",
    email: "jane@test.com",
    phone: "9876543210",
    address: "123 Main Street",
    deliveryPinCode: "500001",
    items: [{ productId, quantity }],
    ...overrides,
  };
}

describe("POST /api/orders", () => {
  it("lets a guest (no session) place an order", async () => {
    const { product } = await seedCatalog();
    const res = await createOrder(jsonRequest("http://localhost/api/orders", orderBody(product.id, 2)));
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.status).toBe("PENDING_PAYMENT");
    expect(body.totalPaise).toBe(500 * 2 + 2000);

    const order = await db.order.findUnique({ where: { id: body.orderId } });
    expect(order?.userId).toBeNull();
  });

  it("decrements product stock on success", async () => {
    const { product } = await seedCatalog();
    await createOrder(jsonRequest("http://localhost/api/orders", orderBody(product.id, 2)));
    const updated = await db.product.findUnique({ where: { id: product.id } });
    expect(updated?.stock).toBe(3);
  });

  it("rejects ordering more than available stock, and does not touch stock", async () => {
    const { product } = await seedCatalog();
    const res = await createOrder(jsonRequest("http://localhost/api/orders", orderBody(product.id, 10)));
    expect(res.status).toBe(409);
    const unchanged = await db.product.findUnique({ where: { id: product.id } });
    expect(unchanged?.stock).toBe(5);
  });

  it("rejects an unserviceable PIN code", async () => {
    const { product } = await seedCatalog();
    const res = await createOrder(jsonRequest("http://localhost/api/orders", orderBody(product.id, 1, { deliveryPinCode: "999999" })));
    expect(res.status).toBe(409);
  });

  it("rejects an inactive product", async () => {
    const { product } = await seedCatalog();
    await db.product.update({ where: { id: product.id }, data: { active: false } });
    const res = await createOrder(jsonRequest("http://localhost/api/orders", orderBody(product.id, 1)));
    expect(res.status).toBe(409);
  });

  it("two concurrent orders for the last unit of stock: exactly one succeeds", async () => {
    const { product } = await seedCatalog();
    await db.product.update({ where: { id: product.id }, data: { stock: 1 } });

    const [a, b] = await Promise.all([
      createOrder(jsonRequest("http://localhost/api/orders", orderBody(product.id, 1))),
      createOrder(jsonRequest("http://localhost/api/orders", orderBody(product.id, 1))),
    ]);
    const statuses = [a.status, b.status].sort();
    expect(statuses).toEqual([201, 409]);

    const finalProduct = await db.product.findUnique({ where: { id: product.id } });
    expect(finalProduct?.stock).toBe(0);
  });

  it("attaches the order to the logged-in user when a session is present", async () => {
    const { product } = await seedCatalog();
    const user = await db.user.create({
      data: { name: "U", email: "u@test.com", phone: "9000000099", passwordHash: await hashPassword("x"), role: "CUSTOMER" },
    });
    const { token } = await createSession(user.id);
    __setMockCookie("hm_session", token);

    const res = await createOrder(jsonRequest("http://localhost/api/orders", orderBody(product.id, 1)));
    const body = await res.json();
    const order = await db.order.findUnique({ where: { id: body.orderId } });
    expect(order?.userId).toBe(user.id);
  });
});

describe("GET /api/orders (IDOR check)", () => {
  it("rejects unauthenticated access", async () => {
    const res = await listOrders();
    expect(res.status).toBe(401);
  });

  it("only returns the caller's own orders, never another user's", async () => {
    const { product } = await seedCatalog();
    const userA = await db.user.create({
      data: { name: "A", email: "a@test.com", phone: "9000000001", passwordHash: await hashPassword("x"), role: "CUSTOMER" },
    });
    const userB = await db.user.create({
      data: { name: "B", email: "b@test.com", phone: "9000000002", passwordHash: await hashPassword("x"), role: "CUSTOMER" },
    });

    const sessionA = await createSession(userA.id);
    __setMockCookie("hm_session", sessionA.token);
    await createOrder(jsonRequest("http://localhost/api/orders", orderBody(product.id, 1)));

    __clearMockCookies();
    const sessionB = await createSession(userB.id);
    __setMockCookie("hm_session", sessionB.token);
    await createOrder(jsonRequest("http://localhost/api/orders", orderBody(product.id, 1)));

    const resB = await listOrders();
    const ordersB = await resB.json();
    expect(ordersB).toHaveLength(1);
    expect(ordersB[0].userId).toBe(userB.id);
  });
});

describe("PATCH /api/orders/[id] (status transitions)", () => {
  async function makeAdmin() {
    const admin = await db.user.create({
      data: { name: "Admin", email: "admin@test.com", phone: "9000000003", passwordHash: await hashPassword("x"), role: "ADMIN" },
    });
    const { token } = await createSession(admin.id);
    __setMockCookie("hm_session", token);
    return admin;
  }

  it("rejects customers entirely", async () => {
    const { product } = await seedCatalog();
    const orderRes = await createOrder(jsonRequest("http://localhost/api/orders", orderBody(product.id, 1)));
    const { orderId } = await orderRes.json();

    const customer = await db.user.create({
      data: { name: "C", email: "c@test.com", phone: "9000000004", passwordHash: await hashPassword("x"), role: "CUSTOMER" },
    });
    const { token } = await createSession(customer.id);
    __setMockCookie("hm_session", token);

    const res = await patchOrder(jsonRequest(`http://localhost/api/orders/${orderId}`, { status: "CONFIRMED" }), {
      params: Promise.resolve({ id: orderId }),
    });
    expect(res.status).toBe(403);
  });

  it("allows a valid forward transition (PENDING_PAYMENT -> CONFIRMED) by admin", async () => {
    const { product } = await seedCatalog();
    const orderRes = await createOrder(jsonRequest("http://localhost/api/orders", orderBody(product.id, 1)));
    const { orderId } = await orderRes.json();
    await makeAdmin();

    const res = await patchOrder(jsonRequest(`http://localhost/api/orders/${orderId}`, { status: "CONFIRMED" }), {
      params: Promise.resolve({ id: orderId }),
    });
    expect(res.status).toBe(200);
    const updated = await db.order.findUnique({ where: { id: orderId } });
    expect(updated?.status).toBe("CONFIRMED");
  });

  it("rejects an invalid transition (PENDING_PAYMENT -> DELIVERED)", async () => {
    const { product } = await seedCatalog();
    const orderRes = await createOrder(jsonRequest("http://localhost/api/orders", orderBody(product.id, 1)));
    const { orderId } = await orderRes.json();
    await makeAdmin();

    const res = await patchOrder(jsonRequest(`http://localhost/api/orders/${orderId}`, { status: "DELIVERED" }), {
      params: Promise.resolve({ id: orderId }),
    });
    expect(res.status).toBe(400);
  });

  it("blocks a farmer from confirming payment even for their own product", async () => {
    const { farmer, product } = await seedCatalog();
    const orderRes = await createOrder(jsonRequest("http://localhost/api/orders", orderBody(product.id, 1)));
    const { orderId } = await orderRes.json();

    const farmerUser = await db.user.create({
      data: { name: "FarmerUser", email: "farmeruser@test.com", phone: "9000000005", passwordHash: await hashPassword("x"), role: "FARMER" },
    });
    await db.farmer.update({ where: { id: farmer.id }, data: { userId: farmerUser.id } });
    const { token } = await createSession(farmerUser.id);
    __setMockCookie("hm_session", token);

    const res = await patchOrder(jsonRequest(`http://localhost/api/orders/${orderId}`, { status: "CONFIRMED" }), {
      params: Promise.resolve({ id: orderId }),
    });
    expect(res.status).toBe(403);
  });

  it("blocks a farmer from updating an order that has none of their products", async () => {
    const { product } = await seedCatalog();
    const orderRes = await createOrder(jsonRequest("http://localhost/api/orders", orderBody(product.id, 1)));
    const { orderId } = await orderRes.json();
    await db.order.update({ where: { id: orderId }, data: { status: "CONFIRMED" } });

    const otherFarmer = await db.farmer.create({
      data: { name: "Other", farmName: "Other Farm", location: "City", description: "d", verified: true },
    });
    const otherFarmerUser = await db.user.create({
      data: { name: "OtherFarmerUser", email: "otherfarmer@test.com", phone: "9000000006", passwordHash: await hashPassword("x"), role: "FARMER" },
    });
    await db.farmer.update({ where: { id: otherFarmer.id }, data: { userId: otherFarmerUser.id } });
    const { token } = await createSession(otherFarmerUser.id);
    __setMockCookie("hm_session", token);

    const res = await patchOrder(jsonRequest(`http://localhost/api/orders/${orderId}`, { status: "PREPARING" }), {
      params: Promise.resolve({ id: orderId }),
    });
    expect(res.status).toBe(403);
  });
});

describe("GET /api/orders/[id] (single-order lookup used by the post-checkout screen)", () => {
  it("a guest order is readable by its id with no session at all", async () => {
    const { product } = await seedCatalog();
    const orderRes = await createOrder(jsonRequest("http://localhost/api/orders", orderBody(product.id, 1)));
    const { orderId } = await orderRes.json();

    const res = await getOrder(new Request(`http://localhost/api/orders/${orderId}`), { params: Promise.resolve({ id: orderId }) });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.id).toBe(orderId);
    expect(body.userId).toBeUndefined();
  });

  it("an account-linked order requires the owner's session", async () => {
    const { product } = await seedCatalog();
    const owner = await db.user.create({
      data: { name: "Owner", email: "owner@test.com", phone: "9000000010", passwordHash: await hashPassword("x"), role: "CUSTOMER" },
    });
    const ownerSession = await createSession(owner.id);
    __setMockCookie("hm_session", ownerSession.token);
    const orderRes = await createOrder(jsonRequest("http://localhost/api/orders", orderBody(product.id, 1)));
    const { orderId } = await orderRes.json();

    __clearMockCookies();
    const resNoSession = await getOrder(new Request(`http://localhost/api/orders/${orderId}`), { params: Promise.resolve({ id: orderId }) });
    expect(resNoSession.status).toBe(403);

    const stranger = await db.user.create({
      data: { name: "Stranger", email: "stranger@test.com", phone: "9000000011", passwordHash: await hashPassword("x"), role: "CUSTOMER" },
    });
    const strangerSession = await createSession(stranger.id);
    __setMockCookie("hm_session", strangerSession.token);
    const resStranger = await getOrder(new Request(`http://localhost/api/orders/${orderId}`), { params: Promise.resolve({ id: orderId }) });
    expect(resStranger.status).toBe(403);

    __clearMockCookies();
    __setMockCookie("hm_session", ownerSession.token);
    const resOwner = await getOrder(new Request(`http://localhost/api/orders/${orderId}`), { params: Promise.resolve({ id: orderId }) });
    expect(resOwner.status).toBe(200);
  });

  it("returns 404 for a nonexistent order", async () => {
    const res = await getOrder(new Request("http://localhost/api/orders/does-not-exist"), { params: Promise.resolve({ id: "does-not-exist" }) });
    expect(res.status).toBe(404);
  });
});

describe("POST /api/orders/[id]/pay (authorization boundary)", () => {
  // Payment-provider keys are intentionally left unset so the route fails fast
  // with "not configured" (500) right after the authorization check — proving
  // a request got past authorization without needing a real Razorpay call.
  beforeEach(() => {
    delete process.env.RAZORPAY_KEY_ID;
    delete process.env.RAZORPAY_KEY_SECRET;
  });

  it("a guest order can be paid for with no session at all (regression: this used to hard-require auth, making guest orders unpayable forever)", async () => {
    const { product } = await seedCatalog();
    const orderRes = await createOrder(jsonRequest("http://localhost/api/orders", orderBody(product.id, 1)));
    const { orderId } = await orderRes.json();

    const res = await payOrder(new Request(`http://localhost/api/orders/${orderId}/pay`, { method: "POST" }), {
      params: Promise.resolve({ id: orderId }),
    });
    // Got past the ownership check; 500 here only means the payment provider isn't configured in this test env.
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("Payment provider not configured");
  });

  it("an account-linked order rejects an unauthenticated caller", async () => {
    const { product } = await seedCatalog();
    const owner = await db.user.create({
      data: { name: "Owner", email: "payowner@test.com", phone: "9000000012", passwordHash: await hashPassword("x"), role: "CUSTOMER" },
    });
    const { token } = await createSession(owner.id);
    __setMockCookie("hm_session", token);
    const orderRes = await createOrder(jsonRequest("http://localhost/api/orders", orderBody(product.id, 1)));
    const { orderId } = await orderRes.json();

    __clearMockCookies();
    const res = await payOrder(new Request(`http://localhost/api/orders/${orderId}/pay`, { method: "POST" }), {
      params: Promise.resolve({ id: orderId }),
    });
    expect(res.status).toBe(403);
  });

  it("an account-linked order rejects a different logged-in user", async () => {
    const { product } = await seedCatalog();
    const owner = await db.user.create({
      data: { name: "Owner2", email: "payowner2@test.com", phone: "9000000013", passwordHash: await hashPassword("x"), role: "CUSTOMER" },
    });
    const ownerSession = await createSession(owner.id);
    __setMockCookie("hm_session", ownerSession.token);
    const orderRes = await createOrder(jsonRequest("http://localhost/api/orders", orderBody(product.id, 1)));
    const { orderId } = await orderRes.json();

    __clearMockCookies();
    const stranger = await db.user.create({
      data: { name: "Stranger2", email: "stranger2@test.com", phone: "9000000014", passwordHash: await hashPassword("x"), role: "CUSTOMER" },
    });
    const strangerSession = await createSession(stranger.id);
    __setMockCookie("hm_session", strangerSession.token);

    const res = await payOrder(new Request(`http://localhost/api/orders/${orderId}/pay`, { method: "POST" }), {
      params: Promise.resolve({ id: orderId }),
    });
    expect(res.status).toBe(403);
  });

  it("the owner of an account-linked order can reach the pay step", async () => {
    const { product } = await seedCatalog();
    const owner = await db.user.create({
      data: { name: "Owner3", email: "payowner3@test.com", phone: "9000000015", passwordHash: await hashPassword("x"), role: "CUSTOMER" },
    });
    const { token } = await createSession(owner.id);
    __setMockCookie("hm_session", token);
    const orderRes = await createOrder(jsonRequest("http://localhost/api/orders", orderBody(product.id, 1)));
    const { orderId } = await orderRes.json();

    const res = await payOrder(new Request(`http://localhost/api/orders/${orderId}/pay`, { method: "POST" }), {
      params: Promise.resolve({ id: orderId }),
    });
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("Payment provider not configured");
  });

  it("returns 404 for a nonexistent order", async () => {
    const res = await payOrder(new Request("http://localhost/api/orders/does-not-exist/pay", { method: "POST" }), {
      params: Promise.resolve({ id: "does-not-exist" }),
    });
    expect(res.status).toBe(404);
  });
});

import { createHmac } from "crypto";
import { db } from "@/lib/db";
import { POST as webhook } from "@/app/api/payments/webhook/route";
import { resetDb } from "../helpers/db";

const SECRET = "test-webhook-secret";

beforeEach(async () => {
  await resetDb();
  process.env.RAZORPAY_WEBHOOK_SECRET = SECRET;
});

afterAll(async () => {
  await db.$disconnect();
});

function sign(body: string, secret = SECRET) {
  return createHmac("sha256", secret).update(body).digest("hex");
}

function makeEvent(orderId: string, amount: number) {
  return JSON.stringify({
    event: "payment.captured",
    payload: { payment: { entity: { id: "pay_test123", amount, notes: { orderId } } } },
  });
}

function webhookRequest(body: string, signature?: string) {
  return new Request("http://localhost/api/payments/webhook", {
    method: "POST",
    headers: signature !== undefined ? { "x-razorpay-signature": signature } : {},
    body,
  });
}

async function seedPendingOrder(totalPaise: number) {
  const farmer = await db.farmer.create({
    data: { name: "F", farmName: "Farm", location: "City", description: "d", verified: true },
  });
  const product = await db.product.create({
    data: { name: "P", description: "d", category: "Vegetables", pricePaise: totalPaise, stock: 10, image: "https://example.com/p.jpg", farmerId: farmer.id, active: true },
  });
  return db.order.create({
    data: {
      customerName: "Jane",
      email: "jane@test.com",
      phone: "9876543210",
      address: "123 Main St",
      deliveryPinCode: "500001",
      subtotalPaise: totalPaise,
      deliveryPaise: 0,
      totalPaise,
      status: "PENDING_PAYMENT",
      items: { create: [{ productId: product.id, productName: product.name, quantity: 1, unitPricePaise: totalPaise }] },
    },
  });
}

describe("POST /api/payments/webhook", () => {
  it("rejects a request with no signature header", async () => {
    const res = await webhook(webhookRequest("{}"));
    expect(res.status).toBe(400);
  });

  it("rejects when the webhook secret isn't configured", async () => {
    delete process.env.RAZORPAY_WEBHOOK_SECRET;
    const res = await webhook(webhookRequest("{}", "anything"));
    expect(res.status).toBe(500);
  });

  it("rejects an invalid signature without crashing", async () => {
    const order = await seedPendingOrder(10000);
    const body = makeEvent(order.id, order.totalPaise);
    const res = await webhook(webhookRequest(body, "deadbeef00112233"));
    expect(res.status).toBe(400);
    expect((await db.order.findUnique({ where: { id: order.id } }))?.status).toBe("PENDING_PAYMENT");
  });

  it("rejects a signature of the wrong length without throwing (regression: timingSafeEqual length mismatch)", async () => {
    const order = await seedPendingOrder(10000);
    const body = makeEvent(order.id, order.totalPaise);
    // A real sha256 hex digest is always 64 chars; this is deliberately shorter.
    const res = await webhook(webhookRequest(body, "ab12"));
    expect(res.status).toBe(400);
  });

  it("rejects a captured amount that doesn't match the order total", async () => {
    const order = await seedPendingOrder(10000);
    const body = makeEvent(order.id, order.totalPaise - 1);
    const res = await webhook(webhookRequest(body, sign(body)));
    expect(res.status).toBe(400);
    expect((await db.order.findUnique({ where: { id: order.id } }))?.status).toBe("PENDING_PAYMENT");
  });

  it("confirms the order on a valid signature with the correct amount", async () => {
    const order = await seedPendingOrder(10000);
    const body = makeEvent(order.id, order.totalPaise);
    const res = await webhook(webhookRequest(body, sign(body)));
    expect(res.status).toBe(200);
    const updated = await db.order.findUnique({ where: { id: order.id } });
    expect(updated?.status).toBe("CONFIRMED");
    expect(updated?.paymentRef).toBe("pay_test123");
  });

  it("is idempotent: replaying the same valid webhook does not reprocess an already-confirmed order", async () => {
    const order = await seedPendingOrder(10000);
    const body = makeEvent(order.id, order.totalPaise);
    await webhook(webhookRequest(body, sign(body)));

    const auditCountAfterFirst = await db.auditLog.count();
    const res = await webhook(webhookRequest(body, sign(body)));
    expect(res.status).toBe(200);
    expect(await db.auditLog.count()).toBe(auditCountAfterFirst);
  });

  it("ignores events for an order that doesn't exist", async () => {
    const body = makeEvent("does-not-exist", 10000);
    const res = await webhook(webhookRequest(body, sign(body)));
    expect(res.status).toBe(200);
  });

  it("ignores a captured payment with no order_id in notes", async () => {
    const body = JSON.stringify({ event: "payment.captured", payload: { payment: { entity: { id: "pay_x", amount: 100, notes: {} } } } });
    const res = await webhook(webhookRequest(body, sign(body)));
    expect(res.status).toBe(200);
  });

  it("ignores unrelated event types", async () => {
    const body = JSON.stringify({ event: "payment.failed", payload: {} });
    const res = await webhook(webhookRequest(body, sign(body)));
    expect(res.status).toBe(200);
  });
});

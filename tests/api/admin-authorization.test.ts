import { db } from "@/lib/db";
import { hashPassword, createSession } from "@/lib/auth";
import { GET as adminProductsGet, POST as adminProductsPost } from "@/app/api/admin/products/route";
import { PUT as adminProductPut, DELETE as adminProductDelete } from "@/app/api/admin/products/[id]/route";
import { GET as adminFarmersGet } from "@/app/api/admin/farmers/route";
import { GET as adminOrdersGet } from "@/app/api/admin/orders/route";
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

async function loginAs(role: "CUSTOMER" | "FARMER" | "ADMIN", email: string) {
  const user = await db.user.create({
    data: { name: role, email, phone: `9${Math.floor(Math.random() * 1_000_000_000)}`, passwordHash: await hashPassword("x"), role },
  });
  const { token } = await createSession(user.id);
  __setMockCookie("hm_session", token);
  return user;
}

async function makeFarmerProduct(farmerUserId?: string) {
  const farmer = await db.farmer.create({
    data: { name: "F", farmName: "Farm", location: "City", description: "d", verified: true, userId: farmerUserId },
  });
  const product = await db.product.create({
    data: { name: "P", description: "d", category: "Vegetables", pricePaise: 100, stock: 5, image: "https://example.com/p.jpg", farmerId: farmer.id, active: true },
  });
  return { farmer, product };
}

describe("GET /api/admin/products (role-scoped visibility)", () => {
  it("customer sees only active products", async () => {
    const { product } = await makeFarmerProduct();
    await db.product.update({ where: { id: product.id }, data: { active: false } });
    await loginAs("CUSTOMER", "cust@test.com");
    const res = await adminProductsGet(new Request("http://localhost/api/admin/products"));
    const body = await res.json();
    expect(body).toHaveLength(0);
  });

  it("farmer sees only their own products, not other farmers'", async () => {
    const farmerUser = await loginAs("FARMER", "farmer@test.com");
    const { product: ownProduct } = await makeFarmerProduct(farmerUser.id);
    await makeFarmerProduct(); // another farmer's product

    const res = await adminProductsGet(new Request("http://localhost/api/admin/products"));
    const body = await res.json();
    expect(body).toHaveLength(1);
    expect(body[0].id).toBe(ownProduct.id);
  });

  it("admin sees everything regardless of active flag or owner", async () => {
    const { product } = await makeFarmerProduct();
    await db.product.update({ where: { id: product.id }, data: { active: false } });
    await loginAs("ADMIN", "admin@test.com");
    const res = await adminProductsGet(new Request("http://localhost/api/admin/products"));
    const body = await res.json();
    expect(body).toHaveLength(1);
  });

  it("unauthenticated requests are rejected", async () => {
    const res = await adminProductsGet(new Request("http://localhost/api/admin/products"));
    expect(res.status).toBe(401);
  });
});

describe("POST /api/admin/products", () => {
  function productPayload(overrides: Record<string, unknown> = {}) {
    return {
      name: "New Product", description: "d", category: "Vegetables",
      pricePaise: 100, unit: "kg", image: "https://example.com/p.jpg", stock: 5, featured: false,
      ...overrides,
    };
  }

  it("rejects a customer", async () => {
    await loginAs("CUSTOMER", "cust@test.com");
    const res = await adminProductsPost(jsonRequest("http://localhost/api/admin/products", productPayload()));
    expect(res.status).toBe(403);
  });

  it("a farmer's product is auto-assigned to their own farm, ignoring a spoofed farmerId", async () => {
    const farmerUser = await loginAs("FARMER", "farmer@test.com");
    const { farmer: ownFarm } = await makeFarmerProduct(farmerUser.id);
    const { farmer: otherFarm } = await makeFarmerProduct();

    const res = await adminProductsPost(jsonRequest("http://localhost/api/admin/products", productPayload({ farmerId: otherFarm.id })));
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.farmerId).toBe(ownFarm.id);
    expect(body.farmerId).not.toBe(otherFarm.id);
  });

  it("admin must supply a farmerId", async () => {
    await loginAs("ADMIN", "admin@test.com");
    const res = await adminProductsPost(jsonRequest("http://localhost/api/admin/products", productPayload()));
    expect(res.status).toBe(400);
  });
});

describe("PUT/DELETE /api/admin/products/[id] (cross-farmer IDOR)", () => {
  it("a farmer cannot edit another farmer's product", async () => {
    const farmerUser = await loginAs("FARMER", "farmer@test.com");
    await makeFarmerProduct(farmerUser.id);
    const { product: otherProduct } = await makeFarmerProduct();

    const res = await adminProductPut(
      jsonRequest(`http://localhost/api/admin/products/${otherProduct.id}`, { stock: 999 }),
      { params: Promise.resolve({ id: otherProduct.id }) }
    );
    expect(res.status).toBe(403);
    expect((await db.product.findUnique({ where: { id: otherProduct.id } }))?.stock).toBe(5);
  });

  it("a farmer cannot delete another farmer's product", async () => {
    const farmerUser = await loginAs("FARMER", "farmer@test.com");
    await makeFarmerProduct(farmerUser.id);
    const { product: otherProduct } = await makeFarmerProduct();

    const res = await adminProductDelete(
      new Request(`http://localhost/api/admin/products/${otherProduct.id}`, { method: "DELETE" }),
      { params: Promise.resolve({ id: otherProduct.id }) }
    );
    expect(res.status).toBe(403);
    expect(await db.product.findUnique({ where: { id: otherProduct.id } })).not.toBeNull();
  });

  it("a farmer CAN edit their own product", async () => {
    const farmerUser = await loginAs("FARMER", "farmer@test.com");
    const { product } = await makeFarmerProduct(farmerUser.id);

    const res = await adminProductPut(
      jsonRequest(`http://localhost/api/admin/products/${product.id}`, { stock: 42 }),
      { params: Promise.resolve({ id: product.id }) }
    );
    expect(res.status).toBe(200);
    expect((await db.product.findUnique({ where: { id: product.id } }))?.stock).toBe(42);
  });
});

describe("GET /api/admin/farmers (admin-only)", () => {
  it("rejects a customer", async () => {
    await loginAs("CUSTOMER", "cust@test.com");
    const res = await adminFarmersGet(new Request("http://localhost/api/admin/farmers"));
    expect(res.status).toBe(403);
  });

  it("rejects a farmer", async () => {
    await loginAs("FARMER", "farmer@test.com");
    const res = await adminFarmersGet(new Request("http://localhost/api/admin/farmers"));
    expect(res.status).toBe(403);
  });

  it("allows an admin", async () => {
    await loginAs("ADMIN", "admin@test.com");
    const res = await adminFarmersGet(new Request("http://localhost/api/admin/farmers"));
    expect(res.status).toBe(200);
  });
});

describe("GET /api/admin/orders", () => {
  it("allows an admin", async () => {
    await loginAs("ADMIN", "admin@test.com");
    const res = await adminOrdersGet(new Request("http://localhost/api/admin/orders"));
    expect(res.status).toBe(200);
  });

  it("rejects a customer", async () => {
    await loginAs("CUSTOMER", "cust@test.com");
    const res = await adminOrdersGet(new Request("http://localhost/api/admin/orders"));
    expect(res.status).toBe(403);
  });

  // Regression test: this route used to be requireRole(["ADMIN"]) only, so the
  // farmer dashboard's order list (which calls this same endpoint) 403'd for
  // every real farmer account.
  it("allows a farmer, scoped to orders containing only their own products", async () => {
    const farmerUser = await loginAs("FARMER", "farmer@test.com");
    const { product: ownProduct } = await makeFarmerProduct(farmerUser.id);
    const { product: otherProduct } = await makeFarmerProduct();

    const ownOrder = await db.order.create({
      data: {
        customerName: "C", email: "c@test.com", phone: "9000000000", address: "addr",
        deliveryPinCode: "500001", subtotalPaise: 100, deliveryPaise: 0, totalPaise: 100,
        items: { create: [{ productId: ownProduct.id, productName: ownProduct.name, quantity: 1, unitPricePaise: 100 }] },
      },
    });
    await db.order.create({
      data: {
        customerName: "D", email: "d@test.com", phone: "9000000001", address: "addr",
        deliveryPinCode: "500001", subtotalPaise: 100, deliveryPaise: 0, totalPaise: 100,
        items: { create: [{ productId: otherProduct.id, productName: otherProduct.name, quantity: 1, unitPricePaise: 100 }] },
      },
    });

    const res = await adminOrdersGet(new Request("http://localhost/api/admin/orders"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(1);
    expect(body[0].id).toBe(ownOrder.id);
  });

  it("returns an empty list for a FARMER-role user with no farmer profile yet", async () => {
    await loginAs("FARMER", "incomplete-farmer@test.com");
    const res = await adminOrdersGet(new Request("http://localhost/api/admin/orders"));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([]);
  });
});

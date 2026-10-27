import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { orderSchema, validateBody } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const user = await getSessionUser();
  const parsed = validateBody(orderSchema, await request.json().catch(() => null));
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  try {
    const result = await db.$transaction(async tx => {
      const pincode = await tx.serviceablePincode.findUnique({ where: { pincode: parsed.data.deliveryPinCode } });
      if (!pincode || !pincode.active) {
        throw new Error("Delivery is not available for this PIN code.");
      }

      const ids = [...new Set(parsed.data.items.map(i => i.productId))];
      const products = await tx.product.findMany({ where: { id: { in: ids }, active: true } });
      if (products.length !== ids.length) throw new Error("One or more products are unavailable.");
      const lines = parsed.data.items.map(item => {
        const p = products.find(x => x.id === item.productId)!;
        if (item.quantity > p.stock) throw new Error(`${p.name} has only ${p.stock} available.`);
        return { productId: p.id, productName: p.name, quantity: item.quantity, unitPricePaise: p.pricePaise, lineTotal: p.pricePaise * item.quantity };
      });
      const subtotalPaise = lines.reduce((sum, l) => sum + l.lineTotal, 0);
      const deliveryPaise = pincode.deliveryFeePaise;
      const order = await tx.order.create({ data: {
        userId: user?.id ?? null,
        customerName: parsed.data.customerName, email: parsed.data.email, phone: parsed.data.phone,
        address: parsed.data.address, deliveryPinCode: parsed.data.deliveryPinCode,
        deliverySlot: parsed.data.deliverySlot ?? null, notes: parsed.data.notes,
        subtotalPaise, deliveryPaise, totalPaise: subtotalPaise + deliveryPaise, status: "PENDING_PAYMENT",
        items: { create: lines.map(({ lineTotal, ...line }) => line) }
      }});
      for (const line of lines) {
        const changed = await tx.product.updateMany({ where: { id: line.productId, stock: { gte: line.quantity } }, data: { stock: { decrement: line.quantity } } });
        if (changed.count !== 1) throw new Error(`${line.productName} just went out of stock. Please retry.`);
      }
      return order;
    });
    return NextResponse.json({ orderId: result.id, status: result.status, totalPaise: result.totalPaise }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not create order." }, { status: 409 });
  }
}

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const orders = await db.order.findMany({
    where: { userId: user.id },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json(orders);
}

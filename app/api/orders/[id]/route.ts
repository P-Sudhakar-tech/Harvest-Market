import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole, getSessionUser } from "@/lib/auth";

const statusSchema = z.object({
  status: z.enum(["PENDING_PAYMENT", "CONFIRMED", "PREPARING", "READY_FOR_PICKUP", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"]),
  note: z.string().max(500).optional(),
});

const FORWARD_TRANSITIONS: Record<string, string[]> = {
  PENDING_PAYMENT: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PREPARING", "CANCELLED"],
  PREPARING: ["READY_FOR_PICKUP", "CANCELLED"],
  READY_FOR_PICKUP: ["OUT_FOR_DELIVERY", "CANCELLED"],
  OUT_FOR_DELIVERY: ["DELIVERED", "CANCELLED"],
  DELIVERED: [],
  CANCELLED: [],
};

async function logAudit(userId: string | undefined, userName: string | null | undefined, action: string, entity: string, entityId: string, details: string | undefined) {
  await db.auditLog.create({ data: { userId, userName, action, entity, entityId, details } });
}

export async function PATCH(request: Request, { params }: { params: { id: string | null } }) {
  const auth = await requireRole(["ADMIN", "FARMER"]);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const user = auth.user!;
  const id: string = params.id!;
  if (!id) return NextResponse.json({ error: "Order ID required" }, { status: 400 });

  const order = await db.order.findUnique({ where: { id }, include: { items: { include: { product: true } } } });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  let body;
  try { body = statusSchema.safeParse(await request.json()); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  if (!body.success) return NextResponse.json({ error: "Invalid status data" }, { status: 400 });

  const { status, note } = body.data;
  const currentStatus = order.status;
  const allowed = FORWARD_TRANSITIONS[currentStatus] ?? [];

  if (!allowed.includes(status)) {
    return NextResponse.json({ error: `Cannot transition from ${currentStatus} to ${status}` }, { status: 400 });
  }

  if (user.role === "FARMER") {
    const farmer = await db.farmer.findFirst({ where: { userId: user.id } });
    if (!farmer) return NextResponse.json({ error: "Farmer profile not found" }, { status: 404 });
    const hasOwnProduct = order.items.some(i => i.product.farmerId === farmer.id);
    if (!hasOwnProduct) return NextResponse.json({ error: "Forbidden: no products from your farm in this order" }, { status: 403 });
    if (status === "CONFIRMED") return NextResponse.json({ error: "Farmers cannot confirm payments" }, { status: 403 });
  }

  try {
    const updated = await db.order.update({
      where: { id },
      data: { status },
      include: { items: true },
    });
    await logAudit(user.id, user.name, "order.status.update", "Order", id, `${currentStatus} → ${status}${note ? ` (${note})` : ""}`);
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Could not update order status" }, { status: 400 });
  }
}

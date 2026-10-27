import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole, getSessionUser } from "@/lib/auth";

export const runtime = "nodejs";

const updateSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  description: z.string().max(1000).optional(),
  category: z.string().min(2).max(50).optional(),
  pricePaise: z.number().int().positive().optional(),
  unit: z.string().max(20).optional(),
  image: z.string().url().optional(),
  stock: z.number().int().min(0).optional(),
  featured: z.boolean().optional(),
  active: z.boolean().optional(),
});

async function logAudit(userId: string | undefined, userName: string | null | undefined, action: string, entity: string, entityId: string, details: string | undefined) {
  await db.auditLog.create({
    data: { userId, userName, action, entity, entityId, details },
  });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole(["ADMIN", "FARMER"]);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const user = auth.user!;
  const { id } = await params;

  const product = await db.product.findUnique({ where: { id } });
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  if (user.role === "FARMER") {
    const farmer = await db.farmer.findFirst({ where: { userId: user.id } });
    if (!farmer || product.farmerId !== farmer.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  let body;
  try { body = updateSchema.safeParse(await request.json()); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  if (!body.success) return NextResponse.json({ error: "Invalid product data" }, { status: 400 });

  try {
    const updated = await db.product.update({ where: { id }, data: body.data });
    await logAudit(user.id, user.name, "product.update", "Product", id, JSON.stringify(body.data));
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Could not update product" }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole(["ADMIN", "FARMER"]);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const user = auth.user!;
  const { id } = await params;

  const product = await db.product.findUnique({ where: { id } });
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  if (user.role === "FARMER") {
    const farmer = await db.farmer.findFirst({ where: { userId: user.id } });
    if (!farmer || product.farmerId !== farmer.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  try {
    await db.product.delete({ where: { id } });
    await logAudit(user.id, user.name, "product.delete", "Product", id, `Deleted ${product.name}`);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not delete product" }, { status: 400 });
  }
}

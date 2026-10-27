import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const auth = await requireRole(["ADMIN"]);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { searchParams } = new URL(request.url);
  const farmerId = searchParams.get("farmerId");
  const status = searchParams.get("status");

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (farmerId) {
    where.items = { some: { product: { farmerId } } };
  }

  const orders = await db.order.findMany({
    where,
    include: { items: { include: { product: true } }, user: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json(orders);
}

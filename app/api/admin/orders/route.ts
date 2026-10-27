import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";

export async function GET(request: Request) {
  const auth = await requireRole(["ADMIN"]);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { searchParams } = new URL(request.url);
  const farmerId = searchParams.get("farmerId");
  const status = searchParams.get("status");

  const where: Record<string, unknown> = {};
  if (farmerId) where.farmerId = farmerId;
  if (status) where.status = status;

  const orders = await db.order.findMany({
    where,
    include: { items: true, user: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json(orders);
}

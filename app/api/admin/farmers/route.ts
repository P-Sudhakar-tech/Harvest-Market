import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";

export async function GET(request: Request) {
  const auth = await requireRole(["ADMIN"]);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { searchParams } = new URL(request.url);
  const verified = searchParams.get("verified");

  const where: Record<string, unknown> = {};
  if (verified !== null) where.verified = verified === "true";

  const farmers = await db.farmer.findMany({
    where,
    include: { user: true, _count: { select: { products: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(farmers);
}

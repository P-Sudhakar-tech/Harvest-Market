import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const product = await db.product.findUnique({
    where: { id },
    include: { farmer: true },
  });

  if (!product || !product.active) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const { farmer, ...fields } = product;
  return NextResponse.json({ ...fields, farmerName: farmer.farmName, farmerLocation: farmer.location });
}

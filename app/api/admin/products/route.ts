import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";

export const runtime = "nodejs";

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().max(1000),
  category: z.string().min(2).max(50),
  pricePaise: z.number().int().positive(),
  unit: z.string().max(20).default("kg"),
  image: z.string().url(),
  stock: z.number().int().min(0),
  featured: z.boolean().default(false),
  farmerId: z.string().min(1).optional(),
});

export async function GET(request: Request) {
  const auth = await requireRole(["ADMIN", "FARMER", "CUSTOMER"]);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const user = auth.user!;

  let where: Record<string, unknown> = {};
  if (user.role === "FARMER") {
    const farmer = await db.farmer.findFirst({ where: { userId: user.id } });
    if (!farmer) return NextResponse.json([]);
    where = { farmerId: farmer.id };
  } else if (user.role === "CUSTOMER") {
    where = { active: true };
  }

  const products = await db.product.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  const auth = await requireRole(["ADMIN", "FARMER"]);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const user = auth.user!;

  let body;
  try { body = schema.safeParse(await request.json()); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  if (!body.success) return NextResponse.json({ error: "Invalid product data" }, { status: 400 });

  let farmerId: string;
  if (user.role === "FARMER") {
    const farmer = await db.farmer.findFirst({ where: { userId: user.id } });
    if (!farmer) return NextResponse.json({ error: "Farmer profile not found" }, { status: 404 });
    farmerId = farmer.id;
  } else {
    const adminFarmerId = body.data.farmerId;
    if (!adminFarmerId) return NextResponse.json({ error: "farmerId is required for admin" }, { status: 400 });
    farmerId = adminFarmerId;
  }

  const { farmerId: _, ...productData } = body.data;

  try {
    const product = await db.product.create({
      data: { ...productData, farmerId },
    });
    return NextResponse.json(product, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Could not create product. Check the farmer ID." }, { status: 400 });
  }
}

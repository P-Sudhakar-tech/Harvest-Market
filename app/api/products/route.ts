import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const products = await db.product.findMany({
    where: { active: true, ...(category && category !== "All produce" ? { category } : {}),
      ...(search ? { OR: [{name:{contains:search}},{description:{contains:search}}] } : {}) },
    include: { farmer: { select: { id:true, farmName:true, location:true } } },
    orderBy: [{featured:"desc"},{name:"asc"}]
  });
  return NextResponse.json(products);
}
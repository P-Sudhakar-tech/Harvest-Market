import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const schema=z.object({
  name:z.string().trim().min(2).max(100),description:z.string().max(1000),
  category:z.string().min(2).max(50),pricePaise:z.number().int().positive(),
  unit:z.string().max(20).default("kg"),image:z.string().url(),stock:z.number().int().min(0),
  farmerId:z.string().min(1),featured:z.boolean().default(false)
});

export async function POST(request:Request) {
  const secret=process.env.ADMIN_API_KEY;
  if(!secret || request.headers.get("x-admin-api-key")!==secret)
    return NextResponse.json({error:"Unauthorized"},{status:401});
  let body;
  try { body=schema.safeParse(await request.json()); }
  catch { return NextResponse.json({error:"Invalid JSON"},{status:400}); }
  if(!body.success) return NextResponse.json({error:"Invalid product data"},{status:400});
  try {
    const product=await db.product.create({data:body.data});
    return NextResponse.json(product,{status:201});
  } catch {
    return NextResponse.json({error:"Could not create product. Check the farmer ID."},{status:400});
  }
}
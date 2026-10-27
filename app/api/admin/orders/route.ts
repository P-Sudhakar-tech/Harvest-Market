import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request:Request) {
  const secret=process.env.ADMIN_API_KEY;
  if(!secret || request.headers.get("x-admin-api-key")!==secret)
    return NextResponse.json({error:"Unauthorized"},{status:401});
  const orders=await db.order.findMany({include:{items:true},orderBy:{createdAt:"desc"},take:100});
  return NextResponse.json(orders);
}
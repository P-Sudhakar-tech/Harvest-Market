import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";

export const runtime = "nodejs";

const pincodeSchema = z.object({
  pincode: z.string().regex(/^[0-9]{6}$/),
  deliveryFeePaise: z.number().int().min(0).default(0),
  active: z.boolean().default(true),
});

export async function GET(request: Request) {
  const auth = await requireRole(["ADMIN"]);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const pincodes = await db.serviceablePincode.findMany({
    orderBy: { pincode: "asc" },
  });
  return NextResponse.json(pincodes);
}

export async function POST(request: Request) {
  const auth = await requireRole(["ADMIN"]);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  let body;
  try { body = pincodeSchema.safeParse(await request.json()); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  if (!body.success) return NextResponse.json({ error: "Invalid pincode data" }, { status: 400 });

  try {
    const pincode = await db.serviceablePincode.create({ data: body.data });
    return NextResponse.json(pincode, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Pincode already exists" }, { status: 409 });
  }
}

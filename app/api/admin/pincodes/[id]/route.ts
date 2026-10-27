import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";

export const runtime = "nodejs";

const pincodeSchema = z.object({
  pincode: z.string().regex(/^[0-9]{6}$/).optional(),
  deliveryFeePaise: z.number().int().min(0).optional(),
  active: z.boolean().optional(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole(["ADMIN"]);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await params;

  let body;
  try { body = pincodeSchema.safeParse(await request.json()); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  if (!body.success) return NextResponse.json({ error: "Invalid pincode data" }, { status: 400 });

  try {
    const pincode = await db.serviceablePincode.update({ where: { id }, data: body.data });
    return NextResponse.json(pincode);
  } catch {
    return NextResponse.json({ error: "Pincode not found" }, { status: 404 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole(["ADMIN"]);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await params;

  try {
    await db.serviceablePincode.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Pincode not found" }, { status: 404 });
  }
}

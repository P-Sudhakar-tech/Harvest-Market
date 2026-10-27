import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";

const verifySchema = z.object({
  verified: z.boolean(),
});

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const auth = await requireRole(["ADMIN"]);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const user = auth.user!;

  let body;
  try { body = verifySchema.safeParse(await request.json()); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  if (!body.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });

  const farmer = await db.farmer.findUnique({ where: { id: params.id }, include: { user: true } });
  if (!farmer) return NextResponse.json({ error: "Farmer not found" }, { status: 404 });

  try {
    const updated = await db.farmer.update({
      where: { id: params.id },
      data: { verified: body.data.verified },
    });
    await db.auditLog.create({
      data: {
        userId: user.id,
        userName: user.name,
        action: body.data.verified ? "farmer.verify" : "farmer.unverify",
        entity: "Farmer",
        entityId: params.id,
        details: `Farmer ${farmer.name} (${farmer.farmName}) ${body.data.verified ? "verified" : "unverified"}`,
      },
    });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Could not update farmer" }, { status: 400 });
  }
}

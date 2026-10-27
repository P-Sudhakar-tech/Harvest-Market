import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";

const payoutSchema = z.object({
  farmerId: z.string().min(1),
  amountPaise: z.number().int().positive(),
  reference: z.string().optional(),
});

export async function GET(request: Request) {
  const auth = await requireRole(["ADMIN"]);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const payouts = await db.payout.findMany({
    include: { farmer: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json(payouts);
}

export async function POST(request: Request) {
  const auth = await requireRole(["ADMIN"]);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  let body;
  try { body = payoutSchema.safeParse(await request.json()); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  if (!body.success) return NextResponse.json({ error: "Invalid payout data" }, { status: 400 });

  const { farmerId, amountPaise, reference } = body.data;

  const farmer = await db.farmer.findUnique({ where: { id: farmerId } });
  if (!farmer) return NextResponse.json({ error: "Farmer not found" }, { status: 404 });

  try {
    const payout = await db.payout.create({
      data: { farmerId, amountPaise, reference },
      include: { farmer: true },
    });
    return NextResponse.json(payout, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Could not create payout" }, { status: 400 });
  }
}

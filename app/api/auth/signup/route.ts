import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

const signupSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(128),
  role: z.enum(["CUSTOMER", "FARMER", "ADMIN"]).default("CUSTOMER"),
});

export async function POST(request: Request) {
  let body;
  try { body = signupSchema.safeParse(await request.json()); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  if (!body.success) return NextResponse.json({ error: "Invalid signup data" }, { status: 400 });

  const { name, email, password, role } = body.data;

  try {
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) return NextResponse.json({ error: "Email already registered" }, { status: 409 });

    const user = await db.user.create({
      data: { name, email, passwordHash: await hashPassword(password), role },
    });
    return NextResponse.json({ id: user.id, email: user.email, role: user.role }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Could not create account" }, { status: 500 });
  }
}

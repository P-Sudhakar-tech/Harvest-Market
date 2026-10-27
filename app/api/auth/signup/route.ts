import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { signupSchema, validateBody } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const parsed = validateBody(signupSchema, await request.json().catch(() => null));
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const { name, email, phone, password, role } = parsed.data;

  try {
    const existingEmail = await db.user.findUnique({ where: { email } });
    if (existingEmail) return NextResponse.json({ error: "Email already registered" }, { status: 409 });

    const existingPhone = await db.user.findUnique({ where: { phone } });
    if (existingPhone) return NextResponse.json({ error: "Mobile number already registered" }, { status: 409 });

    const user = await db.user.create({
      data: { name, email, phone, passwordHash: await hashPassword(password), role },
    });
    return NextResponse.json({ id: user.id, email: user.email, phone: user.phone, role: user.role }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Could not create account" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { comparePassword, createSession } from "@/lib/auth";
import { generateCsrfToken } from "@/lib/validation";

export const runtime = "nodejs";

const signinSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(128),
});

export async function POST(request: Request) {
  let body;
  try { body = signinSchema.safeParse(await request.json()); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  if (!body.success) return NextResponse.json({ error: "Invalid signin data" }, { status: 400 });

  const { email, password } = body.data;

  try {
    const user = await db.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });

    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });

    const { token, expiresAt } = await createSession(user.id);
    const maxAge = Math.floor((expiresAt.getTime() - Date.now()) / 1000);
    const response = NextResponse.json({ id: user.id, email: user.email, role: user.role });
    response.cookies.set("hm_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge,
    });
    // Double-submit CSRF cookie: readable by client JS so it can be echoed back as a header.
    response.cookies.set("hm_csrf", generateCsrfToken(), {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge,
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Could not sign in" }, { status: 500 });
  }
}

'use server';

import { compare, hash } from "bcryptjs";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

const SESSION_COOKIE = "hm_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export async function hashPassword(password: string) {
  return hash(password, 12);
}

export async function comparePassword(plain: string, hashValue: string) {
  return compare(plain, hashValue);
}

export async function generateToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, b => b.toString(16).padStart(2, "0")).join("");
}

export async function createSession(userId: string) {
  const token = await generateToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await db.session.create({ data: { token, userId, expiresAt } });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
  });
  return token;
}

export async function getSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await db.session.findUnique({
    where: { token },
    include: { user: true },
  });
  if (!session || session.expiresAt < new Date()) {
    if (session) await db.session.delete({ where: { id: session.id } });
    return null;
  }
  return session.user;
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await db.session.deleteMany({ where: { token } });
    cookieStore.delete(SESSION_COOKIE);
  }
}

export async function requireRole(allowedRoles: string[]) {
  const user = await getSessionUser();
  if (!user) return { user: null, error: "Not authenticated", status: 401 };
  if (!allowedRoles.includes(user.role)) {
    return { user, error: "Forbidden", status: 403 };
  }
  return { user, error: null, status: 200 };
}

import { z, ZodSchema, ZodError } from "zod";

export const orderSchema = z.object({
  customerName: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().min(10).max(20),
  address: z.string().trim().min(5).max(500),
  deliveryPinCode: z.string().regex(/^[0-9]{6}$/),
  deliverySlot: z.string().optional(),
  notes: z.string().max(500).optional(),
  items: z.array(z.object({ productId: z.string().min(1), quantity: z.number().int().min(1).max(50) })).min(1).max(50)
});

export const signupSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(128),
  role: z.enum(["CUSTOMER", "FARMER", "ADMIN"]).default("CUSTOMER"),
});

export const signinSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(128),
});

export const productSchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().max(1000),
  category: z.string().min(2).max(50),
  pricePaise: z.number().int().positive(),
  unit: z.string().max(20).default("kg"),
  image: z.string().url(),
  stock: z.number().int().min(0),
  featured: z.boolean().default(false),
  farmerId: z.string().min(1).optional(),
});

export const productUpdateSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  description: z.string().max(1000).optional(),
  category: z.string().min(2).max(50).optional(),
  pricePaise: z.number().int().positive().optional(),
  unit: z.string().max(20).optional(),
  image: z.string().url().optional(),
  stock: z.number().int().min(0).optional(),
  featured: z.boolean().optional(),
  active: z.boolean().optional(),
});

export const orderStatusSchema = z.object({
  status: z.enum(["PENDING_PAYMENT", "CONFIRMED", "PREPARING", "READY_FOR_PICKUP", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"]),
  note: z.string().max(500).optional(),
});

export const pincodeSchema = z.object({
  pincode: z.string().regex(/^[0-9]{6}$/),
  deliveryFeePaise: z.number().int().min(0).default(0),
  active: z.boolean().default(true),
});

export const pincodeUpdateSchema = z.object({
  pincode: z.string().regex(/^[0-9]{6}$/).optional(),
  deliveryFeePaise: z.number().int().min(0).optional(),
  active: z.boolean().optional(),
});

export const payoutSchema = z.object({
  farmerId: z.string().min(1),
  amountPaise: z.number().int().positive(),
  reference: z.string().optional(),
});

export const farmerVerifySchema = z.object({
  verified: z.boolean(),
});

export type ValidationResult<T> = { ok: true; data: T } | { ok: false; error: string };

export function validateBody<T>(schema: ZodSchema<T>, body: unknown): ValidationResult<T> {
  const result = schema.safeParse(body);
  if (!result.success) {
    const issues = result.error.issues.map(i => `${i.path.join(".")}: ${i.message}`).join(", ");
    return { ok: false, error: issues };
  }
  return { ok: true, data: result.data as T };
}

export function formatZodError(error: unknown): string {
  if (error instanceof ZodError) {
    return error.issues.map(i => `${i.path.join(".")}: ${i.message}`).join(", ");
  }
  return String(error);
}

export function generateCsrfToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, b => b.toString(16).padStart(2, "0")).join("");
}

export function verifyCsrfToken(token: string, expected: string) {
  if (!token || !expected) return false;
  if (token.length !== expected.length) return false;
  let result = 0;
  for (let i = 0; i < token.length; i++) {
    result |= token.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return result === 0;
}

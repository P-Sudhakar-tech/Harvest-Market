import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request: Request) {
  const signature = request.headers.get("x-razorpay-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const body = await request.text();

  // Verify Razorpay webhook signature manually
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  const expected = createHmac("sha256", secret).update(body).digest("hex");
  if (!timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event;
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { event: eventType, payload } = event;

  if (eventType === "payment.captured") {
    const payment = payload.payment.entity;
    const orderId = payment.notes?.order_id;

    if (!orderId) return NextResponse.json({ received: true });

    // Idempotent: only update if still PENDING_PAYMENT
    const existing = await db.order.findUnique({ where: { id: orderId } });
    if (!existing) return NextResponse.json({ received: true });
    if (existing.status !== "PENDING_PAYMENT") return NextResponse.json({ received: true });

    try {
      const updated = await db.order.update({
        where: { id: orderId },
        data: {
          status: "CONFIRMED",
          paymentRef: payment.id,
        },
      });

      await db.auditLog.create({
        data: {
          action: "payment.captured",
          entity: "Order",
          entityId: orderId,
          details: `Payment captured: ${payment.id}, amount: ${payment.amount} paise`,
        },
      });

      return NextResponse.json({ received: true, order: updated.id });
    } catch {
      return NextResponse.json({ error: "Could not update order" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}

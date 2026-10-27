import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export const runtime = "nodejs";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;

  const order = await db.order.findUnique({ where: { id } });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  if (order.userId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return NextResponse.json({ error: "Payment provider not configured" }, { status: 500 });
  }

  if (order.status !== "PENDING_PAYMENT") {
    return NextResponse.json({ error: `Order is already ${order.status.toLowerCase()}` }, { status: 400 });
  }

  try {
    const razorpayOrder = await razorpay.orders.create({
      amount: order.totalPaise,
      currency: "INR",
      receipt: `receipt_${id}`,
      notes: { orderId: id, customerEmail: order.email },
    });

    await db.order.update({
      where: { id },
      data: { paymentProvider: "razorpay", paymentRef: razorpayOrder.id },
    });

    return NextResponse.json({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    return NextResponse.json({ error: "Could not create payment order" }, { status: 500 });
  }
}

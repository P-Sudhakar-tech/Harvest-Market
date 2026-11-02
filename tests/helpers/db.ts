import { db } from "@/lib/db";

// Deletes all rows in FK-safe order so each test starts from a clean slate.
export async function resetDb() {
  await db.auditLog.deleteMany();
  await db.orderItem.deleteMany();
  await db.order.deleteMany();
  await db.payout.deleteMany();
  await db.product.deleteMany();
  await db.farmer.deleteMany();
  await db.session.deleteMany();
  await db.user.deleteMany();
  await db.serviceablePincode.deleteMany();
}

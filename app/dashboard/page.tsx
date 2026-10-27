import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/auth/signin");
  if (user.role === "ADMIN") redirect("/dashboard/admin");
  redirect("/dashboard/farmer");
}

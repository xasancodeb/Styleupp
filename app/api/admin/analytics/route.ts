import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// GET /api/admin/analytics — time-series + breakdowns for the admin dashboard.
export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const admin = supabaseAdmin();
  const { data: bookings } = await admin
    .from("bookings")
    .select("status, total, scheduled_for, created_at, stylist_id");

  const all = bookings ?? [];

  // Revenue by month (last 6 months).
  const months: { month: string; revenue: number; bookings: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i, 1);
    const key = d.toLocaleDateString("en-GB", { month: "short", year: "2-digit" });
    const inMonth = all.filter((b) => {
      const c = new Date(b.created_at);
      return c.getMonth() === d.getMonth() && c.getFullYear() === d.getFullYear();
    });
    const revenue = inMonth
      .filter((b) => ["confirmed", "completed"].includes(b.status))
      .reduce((s, b) => s + Number(b.total ?? 0), 0);
    months.push({ month: key, revenue: Math.round(revenue * 100) / 100, bookings: inMonth.length });
  }

  // Status breakdown.
  const statusCounts: Record<string, number> = {};
  for (const b of all) statusCounts[b.status] = (statusCounts[b.status] ?? 0) + 1;

  // Top stylists by booking volume.
  const byStylist: Record<string, number> = {};
  for (const b of all) byStylist[b.stylist_id] = (byStylist[b.stylist_id] ?? 0) + 1;
  const topStylists = Object.entries(byStylist)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([slug, count]) => ({ slug, count }));

  return NextResponse.json({ months, statusCounts, topStylists });
}

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// GET /api/admin/stats — marketplace KPIs + pending applications.
export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const admin = supabaseAdmin();
  const [
    { data: bookings },
    { data: stylists },
    { data: applications },
    { data: payments },
    { count: userCount },
  ] = await Promise.all([
    admin.from("bookings").select("status, total, platform_fee"),
    admin.from("stylists").select("id, status"),
    admin.from("stylist_applications").select("*").order("created_at", { ascending: false }),
    admin.from("payments").select("platform_fee, status"),
    admin.from("profiles").select("id", { count: "exact", head: true }),
  ]);

  const all = bookings ?? [];
  const confirmed = all.filter((b) => ["confirmed", "completed"].includes(b.status));
  const grossRevenue = confirmed.reduce((s, b) => s + Number(b.total ?? 0), 0);
  const platformRevenue = (payments ?? [])
    .filter((p) => p.status === "paid")
    .reduce((s, p) => s + Number(p.platform_fee ?? 0), 0);

  return NextResponse.json({
    stats: {
      totalBookings: all.length,
      confirmedBookings: confirmed.length,
      grossRevenue: Math.round(grossRevenue * 100) / 100,
      platformRevenue: Math.round(platformRevenue * 100) / 100,
      activeStylists: (stylists ?? []).filter((s) => s.status === "active").length,
      totalUsers: userCount ?? 0,
      pendingApplications: (applications ?? []).filter((a) => a.status === "pending").length,
    },
    applications: applications ?? [],
  });
}

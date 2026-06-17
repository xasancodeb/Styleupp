import { NextResponse } from "next/server";
import { bearerToken, userScopedClient, serverClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// Confirms the bearer token belongs to an admin. Returns the user id or null.
async function requireAdmin(request: Request): Promise<string | null> {
  const token = bearerToken(request);
  if (!token) return null;
  const supabase = userScopedClient(token);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  return profile?.role === "admin" ? user.id : null;
}

// GET /api/admin/stats — platform-wide stats + pending applications.
export async function GET(request: Request) {
  try {
    const adminId = await requireAdmin(request);
    if (!adminId) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const admin = serverClient();

    const [{ data: bookings }, { data: stylists }, { data: applications }] = await Promise.all([
      admin.from("bookings").select("status, amount, platform_fee, total"),
      admin.from("stylists").select("id, status"),
      admin.from("stylist_applications").select("*").order("created_at", { ascending: false }),
    ]);

    const allBookings = bookings ?? [];
    const confirmed = allBookings.filter((b) => b.status === "confirmed" || b.status === "completed");
    const grossRevenue = confirmed.reduce((sum, b) => sum + Number(b.total ?? 0), 0);
    const platformRevenue = confirmed.reduce((sum, b) => sum + Number(b.platform_fee ?? 0), 0);
    const pendingApplications = (applications ?? []).filter((a) => a.status === "pending");

    return NextResponse.json({
      stats: {
        totalBookings: allBookings.length,
        confirmedBookings: confirmed.length,
        grossRevenue: Math.round(grossRevenue * 100) / 100,
        platformRevenue: Math.round(platformRevenue * 100) / 100,
        activeStylists: (stylists ?? []).filter((s) => s.status === "active").length,
        pendingApplications: pendingApplications.length,
      },
      applications: applications ?? [],
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unexpected error" },
      { status: 500 }
    );
  }
}

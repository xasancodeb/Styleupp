import { NextResponse } from "next/server";
import { requireStylist } from "@/lib/auth";
import { supabaseServer, supabaseAdmin } from "@/lib/supabase/server";
import { tierForMonthlySessions } from "@/lib/commission";

export const dynamic = "force-dynamic";

// GET /api/stylist/earnings — earnings summary + upcoming bookings + tier.
export async function GET() {
  const auth = await requireStylist();
  if (!auth.ok) return auth.response;

  const supabase = await supabaseServer();
  const { data: stylist } = await supabase
    .from("stylists")
    .select("id, slug, sessions_completed, commission_rate, payouts_enabled, stripe_account_id")
    .eq("profile_id", auth.user.id)
    .maybeSingle();

  if (!stylist) {
    return NextResponse.json({
      stylist: null,
      summary: { lifetime: 0, pending: 0, paidCount: 0, monthSessions: 0 },
      bookings: [],
      tier: tierForMonthlySessions(0),
    });
  }

  const admin = supabaseAdmin();
  const [{ data: payments }, { data: bookings }] = await Promise.all([
    admin.from("payments").select("stylist_earnings, status, created_at").eq("stylist_account_id", stylist.id),
    admin
      .from("bookings")
      .select("*")
      .eq("stylist_id", stylist.slug)
      .order("scheduled_for", { ascending: true }),
  ]);

  const paid = (payments ?? []).filter((p) => p.status === "paid");
  const lifetime = paid.reduce((s, p) => s + Number(p.stylist_earnings ?? 0), 0);

  const monthAgo = Date.now() - 30 * 864e5;
  const monthSessions = (bookings ?? []).filter(
    (b) => ["confirmed", "completed"].includes(b.status) && new Date(b.scheduled_for).getTime() >= monthAgo
  ).length;

  const upcoming = (bookings ?? []).filter(
    (b) => b.status === "confirmed" && new Date(b.scheduled_for).getTime() >= Date.now()
  );

  return NextResponse.json({
    stylist: {
      payoutsEnabled: stylist.payouts_enabled,
      connected: Boolean(stylist.stripe_account_id),
      sessionsCompleted: stylist.sessions_completed,
    },
    summary: {
      lifetime: Math.round(lifetime * 100) / 100,
      paidCount: paid.length,
      monthSessions,
    },
    bookings: upcoming,
    tier: tierForMonthlySessions(monthSessions),
  });
}

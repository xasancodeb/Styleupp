import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { notify } from "@/lib/notifications";
import { bookingReminderEmail } from "@/lib/email";
import { getStylist } from "@/lib/data";

export const dynamic = "force-dynamic";

// GET/POST /api/cron/reminders — sends 24h reminders for confirmed bookings.
// Secure with CRON_SECRET via the `x-cron-secret` header (or ?secret=). Call it
// hourly from a scheduler (Vercel Cron, Supabase scheduled function, cron job).
async function run(request: Request): Promise<NextResponse> {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    const provided =
      (auth?.toLowerCase().startsWith("bearer ") ? auth.slice(7) : null) ??
      request.headers.get("x-cron-secret") ??
      new URL(request.url).searchParams.get("secret");
    if (provided !== secret) {
      return NextResponse.json({ error: "Unauthorised." }, { status: 401 });
    }
  }

  const admin = supabaseAdmin();
  const now = Date.now();
  const from = new Date(now + 23 * 36e5).toISOString();
  const to = new Date(now + 25 * 36e5).toISOString();

  const { data: bookings } = await admin
    .from("bookings")
    .select("id, client_id, stylist_id, service_name, scheduled_for")
    .eq("status", "confirmed")
    .gte("scheduled_for", from)
    .lte("scheduled_for", to);

  let sent = 0;
  for (const b of bookings ?? []) {
    // Dedupe: skip if a reminder notification already exists for this booking.
    const { data: existing } = await admin
      .from("notifications")
      .select("id")
      .eq("profile_id", b.client_id)
      .eq("type", "booking_reminder")
      .contains("data", { bookingId: b.id })
      .maybeSingle();
    if (existing) continue;

    const { data: profile } = await admin
      .from("profiles")
      .select("email, full_name")
      .eq("id", b.client_id)
      .single();

    const when = new Date(b.scheduled_for).toLocaleString("en-GB");
    const stylistName = getStylist(b.stylist_id)?.name ?? "your stylist";
    await notify(admin, {
      profileId: b.client_id,
      type: "booking_reminder",
      title: "Your session is tomorrow",
      body: `${b.service_name} with ${stylistName} on ${when}.`,
      data: { bookingId: b.id },
      email: profile?.email
        ? {
            to: profile.email as string,
            ...bookingReminderEmail({ name: (profile.full_name as string) ?? "", stylist: stylistName, when }),
          }
        : undefined,
    });
    sent += 1;
  }

  return NextResponse.json({ checked: bookings?.length ?? 0, sent });
}

export const GET = run;
export const POST = run;

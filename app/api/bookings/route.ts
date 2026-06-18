import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";
import { resolveStylist, getService } from "@/lib/stylists";
import { priceBreakdown } from "@/lib/stripe";
import { commissionSplit } from "@/lib/commission";
import { parseBody, createBookingSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";
import { sanitizeText } from "@/lib/sanitize";

export const dynamic = "force-dynamic";

// GET /api/bookings — the signed-in user's bookings.
export async function GET() {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("client_id", auth.user.id)
    .order("scheduled_for", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ bookings: data ?? [] });
}

// POST /api/bookings — create a pending booking (payment is taken separately).
export async function POST(request: Request) {
  const limited = rateLimit(request, "bookings:create");
  if (limited) return limited;

  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  const parsed = await parseBody(request, createBookingSchema);
  if (!parsed.ok) return parsed.response;
  const { stylistId, serviceId, scheduledFor, notes } = parsed.data;

  const stylist = await resolveStylist(stylistId);
  const service = getService(stylistId, serviceId);
  if (!stylist || !service) {
    return NextResponse.json({ error: "Unknown stylist or service." }, { status: 404 });
  }

  // Reject bookings in the past.
  if (new Date(scheduledFor).getTime() <= Date.now()) {
    return NextResponse.json({ error: "Choose a future time slot." }, { status: 400 });
  }

  const { base, fee, total } = priceBreakdown(service.price);
  const split = commissionSplit(service.price, stylist.commissionRate);
  const supabase = await supabaseServer();

  const { data, error } = await supabase
    .from("bookings")
    .insert({
      client_id: auth.user.id,
      stylist_id: stylistId,
      stylist_account_id: stylist.accountId,
      service_id: serviceId,
      service_name: service.name,
      session_type: service.sessionType,
      scheduled_for: scheduledFor,
      duration_minutes: service.durationMinutes,
      amount: base,
      platform_fee: fee + split.platformFee,
      total,
      status: "pending",
      notes: notes ? sanitizeText(notes, 1000) : null,
    })
    .select()
    .single();

  if (error) {
    // 23505 = unique violation on the no-double-book index.
    if ((error as { code?: string }).code === "23505") {
      return NextResponse.json(
        { error: "That time slot was just taken. Please choose another." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ booking: data }, { status: 201 });
}

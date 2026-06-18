import { NextResponse } from "next/server";
import { getStripe, priceBreakdown, toPence } from "@/lib/stripe";
import { commissionSplit } from "@/lib/commission";
import { resolveStylist, getService } from "@/lib/stylists";
import { requireUser } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";
import { parseBody, createBookingSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";
import { sanitizeText } from "@/lib/sanitize";

export const dynamic = "force-dynamic";

// POST /api/payments/create-checkout
// Creates a pending booking + payment, then a Stripe Checkout session. When the
// stylist has a connected payouts account, the platform takes an application
// fee (service fee + commission) and transfers the remainder to the stylist.
export async function POST(request: Request) {
  const limited = rateLimit(request, "checkout");
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
  if (new Date(scheduledFor).getTime() <= Date.now()) {
    return NextResponse.json({ error: "Choose a future time slot." }, { status: 400 });
  }

  const { base, fee, total, totalPence } = priceBreakdown(service.price);
  const split = commissionSplit(service.price, stylist.commissionRate);
  const supabase = await supabaseServer();

  // Create the pending booking first so the unique index blocks double-booking.
  const { data: booking, error: bookingError } = await supabase
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

  if (bookingError) {
    if ((bookingError as { code?: string }).code === "23505") {
      return NextResponse.json({ error: "That slot was just taken. Choose another." }, { status: 409 });
    }
    return NextResponse.json({ error: bookingError.message }, { status: 500 });
  }

  // Record a pending payment.
  const { data: payment } = await supabase
    .from("payments")
    .insert({
      booking_id: booking.id,
      client_id: auth.user.id,
      stylist_account_id: stylist.accountId,
      amount: total,
      platform_fee: fee + split.platformFee,
      stylist_earnings: split.stylistEarnings,
      status: "pending",
    })
    .select()
    .single();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const usesConnect = Boolean(stylist.stripeAccountId && stylist.payoutsEnabled);

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: auth.user.email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "gbp",
            unit_amount: totalPence,
            product_data: {
              name: `${service.name} with ${stylist.name}`,
              description: `${service.durationMinutes} min · ${service.sessionType} · incl. service fee`,
            },
          },
        },
      ],
      payment_intent_data: usesConnect
        ? {
            application_fee_amount: totalPence - toPence(split.stylistEarnings),
            transfer_data: { destination: stylist.stripeAccountId! },
          }
        : undefined,
      metadata: {
        bookingId: booking.id,
        paymentId: payment?.id ?? "",
        clientId: auth.user.id,
        stylistId,
        stylistEarnings: String(split.stylistEarnings),
      },
      success_url: `${appUrl}/booking/success?stylist=${stylistId}&service=${serviceId}&when=${encodeURIComponent(
        scheduledFor
      )}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/book?stylist=${stylistId}&service=${serviceId}`,
    });

    return NextResponse.json({ url: session.url, id: session.id, bookingId: booking.id });
  } catch (err) {
    // Roll back the held slot if Stripe isn't configured / errored.
    await supabase.from("bookings").update({ status: "cancelled" }).eq("id", booking.id);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Payment could not be started." },
      { status: 500 }
    );
  }
}

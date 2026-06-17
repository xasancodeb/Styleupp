import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { serverClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";
// Stripe needs the raw body to verify the signature — disable any parsing.
export const runtime = "nodejs";

// POST /api/payments/webhook — handle Stripe events.
export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Missing signature or webhook secret" }, { status: 400 });
  }

  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${err instanceof Error ? err.message : ""}` },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await confirmBooking(session);
        break;
      }
      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        await handleRefund(charge);
        break;
      }
      default:
        // Other event types are acknowledged but ignored.
        break;
    }
    return NextResponse.json({ received: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Webhook handler failed" },
      { status: 500 }
    );
  }
}

async function confirmBooking(session: Stripe.Checkout.Session) {
  const meta = session.metadata ?? {};
  const supabase = serverClient();

  const paymentIntent =
    typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null;

  // If we created a pending booking up front, confirm it.
  if (meta.bookingId) {
    await supabase
      .from("bookings")
      .update({
        status: "confirmed",
        stripe_session_id: session.id,
        stripe_payment_intent: paymentIntent,
      })
      .eq("id", meta.bookingId);
  } else if (meta.clientId && meta.stylistId && meta.serviceId) {
    // Otherwise create the confirmed booking now.
    await supabase.from("bookings").insert({
      client_id: meta.clientId,
      stylist_id: meta.stylistId,
      service_id: meta.serviceId,
      service_name: session.metadata?.serviceName ?? "Styling session",
      session_type: session.metadata?.sessionType ?? "virtual",
      scheduled_for: meta.scheduledFor,
      amount: Number(meta.base ?? 0),
      platform_fee: Number(meta.fee ?? 0),
      total: Number(meta.total ?? (session.amount_total ?? 0) / 100),
      status: "confirmed",
      stripe_session_id: session.id,
      stripe_payment_intent: paymentIntent,
    });
  }

  // Bump the stylist's completed-session counter via the RPC.
  if (meta.stylistId) {
    await supabase.rpc("increment_stylist_sessions", { stylist_uuid: meta.stylistId });
  }
}

async function handleRefund(charge: Stripe.Charge) {
  const paymentIntent =
    typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id ?? null;
  if (!paymentIntent) return;

  const supabase = serverClient();
  await supabase
    .from("bookings")
    .update({ status: "refunded" })
    .eq("stripe_payment_intent", paymentIntent);
}

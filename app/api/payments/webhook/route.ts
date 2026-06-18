import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe, formatGBP } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase/server";
import { notify } from "@/lib/notifications";
import { bookingConfirmedEmail } from "@/lib/email";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Missing signature or webhook secret." }, { status: 400 });
  }

  const rawBody = await request.text();
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    return NextResponse.json(
      { error: `Signature verification failed: ${err instanceof Error ? err.message : ""}` },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await onCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case "charge.refunded":
        await onChargeRefunded(event.data.object as Stripe.Charge);
        break;
      case "account.updated":
        await onAccountUpdated(event.data.object as Stripe.Account);
        break;
      case "payment_intent.payment_failed":
        await onPaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      default:
        break;
    }
    return NextResponse.json({ received: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Webhook handler failed." },
      { status: 500 }
    );
  }
}

async function onCheckoutCompleted(session: Stripe.Checkout.Session) {
  const meta = session.metadata ?? {};
  const admin = supabaseAdmin();
  const paymentIntent =
    typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null;

  if (meta.bookingId) {
    const { data: booking } = await admin
      .from("bookings")
      .update({ status: "confirmed", confirmed_at: new Date().toISOString() })
      .eq("id", meta.bookingId)
      .select()
      .single();

    await admin
      .from("payments")
      .update({ status: "paid", stripe_payment_intent: paymentIntent })
      .eq("booking_id", meta.bookingId);

    // Bump the stylist's session counter when an account exists.
    if (booking?.stylist_account_id) {
      await admin.rpc("increment_stylist_sessions", { stylist_uuid: booking.stylist_account_id });
    }

    if (booking && meta.clientId) {
      const { data: profile } = await admin
        .from("profiles")
        .select("email, full_name")
        .eq("id", meta.clientId)
        .single();
      if (profile?.email) {
        const email = bookingConfirmedEmail({
          name: (profile.full_name as string) ?? "",
          stylist: meta.stylistId ?? "your stylist",
          service: booking.service_name,
          when: new Date(booking.scheduled_for).toLocaleString("en-GB"),
          total: formatGBP(Number(booking.total)),
        });
        await notify(admin, {
          profileId: meta.clientId,
          type: "booking_confirmed",
          title: "Booking confirmed",
          body: `${booking.service_name} on ${new Date(booking.scheduled_for).toLocaleString("en-GB")}.`,
          data: { bookingId: booking.id },
          email: { to: profile.email as string, ...email },
        });
      }
    }
  }
}

async function onChargeRefunded(charge: Stripe.Charge) {
  const admin = supabaseAdmin();
  const paymentIntent =
    typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id ?? null;
  if (!paymentIntent) return;

  const refunded = (charge.amount_refunded ?? 0) / 100;
  const fullyRefunded = charge.amount_refunded >= charge.amount;

  await admin
    .from("payments")
    .update({
      status: fullyRefunded ? "refunded" : "partially_refunded",
      refunded_amount: refunded,
      stripe_charge_id: charge.id,
    })
    .eq("stripe_payment_intent", paymentIntent);

  if (fullyRefunded) {
    await admin.from("bookings").update({ status: "refunded" }).eq("stripe_payment_intent", paymentIntent);
  }
}

async function onAccountUpdated(account: Stripe.Account) {
  const admin = supabaseAdmin();
  const enabled = Boolean(account.payouts_enabled && account.charges_enabled);
  await admin
    .from("stylists")
    .update({ payouts_enabled: enabled, onboarding_complete: enabled })
    .eq("stripe_account_id", account.id);
}

async function onPaymentFailed(intent: Stripe.PaymentIntent) {
  const admin = supabaseAdmin();
  await admin.from("payments").update({ status: "failed" }).eq("stripe_payment_intent", intent.id);
}

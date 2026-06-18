import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { supabaseServer, supabaseAdmin } from "@/lib/supabase/server";
import { parseBody, updateBookingSchema } from "@/lib/validation";
import { refundPaymentIntent, formatGBP } from "@/lib/stripe";
import { notify } from "@/lib/notifications";
import { bookingCancelledEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

const MAX_RESCHEDULES = 3;

// Cancellation policy: >48h full refund, 24-48h 50%, <24h none.
function refundRate(scheduledFor: string): number {
  const hours = (new Date(scheduledFor).getTime() - Date.now()) / 36e5;
  if (hours >= 48) return 1;
  if (hours >= 24) return 0.5;
  return 0;
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", id)
    .eq("client_id", auth.user.id)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  return NextResponse.json({ booking: data });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  const parsed = await parseBody(request, updateBookingSchema);
  if (!parsed.ok) return parsed.response;
  const { action, scheduledFor, reason } = parsed.data;

  const supabase = await supabaseServer();
  const { data: booking } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", id)
    .eq("client_id", auth.user.id)
    .maybeSingle();

  if (!booking) return NextResponse.json({ error: "Booking not found." }, { status: 404 });

  const admin = supabaseAdmin();

  if (action === "cancel") {
    if (booking.status === "cancelled" || booking.status === "refunded") {
      return NextResponse.json({ error: "Booking is already cancelled." }, { status: 409 });
    }
    const rate = refundRate(booking.scheduled_for);
    const refundAmount = Math.round(booking.total * rate * 100) / 100;

    // Issue the Stripe refund if money was taken.
    const { data: payment } = await admin
      .from("payments")
      .select("*")
      .eq("booking_id", id)
      .maybeSingle();

    if (payment?.stripe_payment_intent && rate > 0) {
      try {
        await refundPaymentIntent(payment.stripe_payment_intent, refundAmount);
        await admin
          .from("payments")
          .update({
            status: rate >= 1 ? "refunded" : "partially_refunded",
            refunded_amount: refundAmount,
          })
          .eq("id", payment.id);
      } catch (err) {
        return NextResponse.json(
          { error: `Refund failed: ${err instanceof Error ? err.message : "unknown"}` },
          { status: 502 }
        );
      }
    }

    const { data: updated, error } = await admin
      .from("bookings")
      .update({
        status: rate > 0 ? "refunded" : "cancelled",
        cancelled_at: new Date().toISOString(),
        cancellation_reason: reason ?? null,
        refund_amount: refundAmount,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const email = bookingCancelledEmail({
      name: auth.user.fullName ?? "",
      service: booking.service_name,
      when: new Date(booking.scheduled_for).toLocaleString("en-GB"),
      refund: formatGBP(refundAmount),
    });
    await notify(admin, {
      profileId: auth.user.id,
      type: "booking_cancelled",
      title: "Booking cancelled",
      body: `Your ${booking.service_name} session was cancelled. Refund: ${formatGBP(refundAmount)}.`,
      data: { bookingId: id },
      email: { to: auth.user.email, ...email },
    });

    return NextResponse.json({ booking: updated, refund: { rate, amount: refundAmount } });
  }

  if (action === "reschedule") {
    if (!scheduledFor) {
      return NextResponse.json({ error: "scheduledFor is required to reschedule." }, { status: 400 });
    }
    if (new Date(scheduledFor).getTime() <= Date.now()) {
      return NextResponse.json({ error: "Choose a future time slot." }, { status: 400 });
    }
    if (booking.reschedule_count >= MAX_RESCHEDULES) {
      return NextResponse.json({ error: "This booking has been rescheduled too many times." }, { status: 409 });
    }
    if (["cancelled", "refunded", "completed"].includes(booking.status)) {
      return NextResponse.json({ error: "This booking can no longer be changed." }, { status: 409 });
    }

    const { data: updated, error } = await admin
      .from("bookings")
      .update({
        scheduled_for: scheduledFor,
        rescheduled_from: booking.scheduled_for,
        reschedule_count: booking.reschedule_count + 1,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if ((error as { code?: string }).code === "23505") {
        return NextResponse.json({ error: "That time slot is taken. Choose another." }, { status: 409 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await notify(admin, {
      profileId: auth.user.id,
      type: "booking_rescheduled",
      title: "Booking rescheduled",
      body: `Your ${booking.service_name} session was moved to ${new Date(scheduledFor).toLocaleString("en-GB")}.`,
      data: { bookingId: id },
    });
    return NextResponse.json({ booking: updated });
  }

  if (action === "complete") {
    const { data: updated, error } = await admin
      .from("bookings")
      .update({ status: "completed", completed_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ booking: updated });
  }

  return NextResponse.json({ error: "Unsupported action." }, { status: 400 });
}

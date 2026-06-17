import { NextResponse } from "next/server";
import { getStripe, priceBreakdown } from "@/lib/stripe";
import { getStylist, getService } from "@/lib/data";
import { bearerToken, userScopedClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// POST /api/payments/create-checkout — create a Stripe Checkout session for a
// booking and return the hosted-page URL.
export async function POST(request: Request) {
  let body: { stylistId?: string; serviceId?: string; scheduledFor?: string; bookingId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { stylistId, serviceId, scheduledFor, bookingId } = body;
  if (!stylistId || !serviceId || !scheduledFor) {
    return NextResponse.json(
      { error: "stylistId, serviceId and scheduledFor are required" },
      { status: 400 }
    );
  }

  const stylist = getStylist(stylistId);
  const service = getService(stylistId, serviceId);
  if (!stylist || !service) {
    return NextResponse.json({ error: "Unknown stylist or service" }, { status: 404 });
  }

  const { totalPence, base, fee, total } = priceBreakdown(service.price);

  // Best-effort: capture the authenticated user so the webhook can reconcile.
  let clientId: string | null = null;
  const token = bearerToken(request);
  if (token) {
    try {
      const {
        data: { user },
      } = await userScopedClient(token).auth.getUser();
      clientId = user?.id ?? null;
    } catch {
      // anonymous checkout still allowed in the demo
    }
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "gbp",
            unit_amount: totalPence,
            product_data: {
              name: `${service.name} with ${stylist.name}`,
              description: `${service.durationMinutes} min · ${service.sessionType} · includes 5% platform fee`,
            },
          },
        },
      ],
      metadata: {
        stylistId,
        serviceId,
        scheduledFor,
        bookingId: bookingId ?? "",
        clientId: clientId ?? "",
        base: String(base),
        fee: String(fee),
        total: String(total),
      },
      success_url: `${appUrl}/booking/success?stylist=${stylistId}&service=${serviceId}&when=${encodeURIComponent(
        scheduledFor
      )}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/book?stylist=${stylistId}&service=${serviceId}`,
    });

    return NextResponse.json({ url: session.url, id: session.id });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Stripe is not configured" },
      { status: 500 }
    );
  }
}

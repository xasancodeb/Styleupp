import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { z } from "zod";
import { getStripe, isStripeConfigured, toPence } from "@/lib/stripe";
import { parseBody } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";
import { sanitizeText } from "@/lib/sanitize";
import { supabaseAdmin } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const giftSchema = z.object({
  amount: z.number().int().min(10).max(1000),
  to: z.string().min(1).max(120),
  from: z.string().max(120).optional().default(""),
  message: z.string().max(500).optional().default(""),
});

function giftCode(): string {
  const alpha = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(8);
  let out = "";
  for (let i = 0; i < 8; i++) {
    out += alpha[bytes[i] % alpha.length];
    if (i === 3) out += "-";
  }
  return out;
}

// POST /api/gift/create-checkout — real Stripe payment for a gift card.
// The code is generated server-side and only revealed on the paid success URL.
export async function POST(request: Request) {
  const limited = rateLimit(request, "gift", 10);
  if (limited) return limited;

  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Payments are not configured yet. Please try again soon." },
      { status: 503 }
    );
  }

  const parsed = await parseBody(request, giftSchema);
  if (!parsed.ok) return parsed.response;
  const d = parsed.data;

  const origin =
    request.headers.get("origin") ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000";

  const code = giftCode();
  const to = sanitizeText(d.to, 120);
  const from = sanitizeText(d.from ?? "", 120);
  const message = sanitizeText(d.message ?? "", 500);

  try {
    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "gbp",
            unit_amount: toPence(d.amount),
            product_data: {
              name: `StyleUp gift card · £${d.amount}`,
              description: `For ${to}${from ? `, from ${from}` : ""}. Redeemable against any StyleUp session.`,
            },
          },
        },
      ],
      metadata: { kind: "gift_card", code, to, from, message, amount: String(d.amount) },
      success_url: `${origin}/gift?paid=1&code=${encodeURIComponent(code)}&value=${d.amount}&to=${encodeURIComponent(to)}`,
      cancel_url: `${origin}/gift`,
    });

    // Record the pending gift so support can verify and redeem codes manually.
    try {
      await supabaseAdmin().from("leads").insert({
        type: "waitlist",
        email: "gift@internal",
        payload: { kind: "gift_card", code, to, from, amount: String(d.amount), stripe_session: session.id },
      });
    } catch {
      // Metadata on the Stripe session is the source of truth; this is a convenience copy.
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[gift]", err);
    return NextResponse.json({ error: "Could not start checkout. Please try again." }, { status: 500 });
  }
}

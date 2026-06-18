import { NextResponse } from "next/server";
import { requireStylist } from "@/lib/auth";
import { supabaseServer, supabaseAdmin } from "@/lib/supabase/server";
import { createConnectAccount, createAccountLink, createLoginLink, accountPayoutsEnabled } from "@/lib/stripe";

export const dynamic = "force-dynamic";

// GET /api/stripe/connect — current connect status.
export async function GET() {
  const auth = await requireStylist();
  if (!auth.ok) return auth.response;
  const supabase = await supabaseServer();
  const { data } = await supabase
    .from("stylists")
    .select("stripe_account_id, payouts_enabled")
    .eq("profile_id", auth.user.id)
    .maybeSingle();
  return NextResponse.json({
    connected: Boolean(data?.stripe_account_id),
    payoutsEnabled: Boolean(data?.payouts_enabled),
  });
}

// POST /api/stripe/connect — start or resume Connect onboarding; returns a URL.
export async function POST() {
  const auth = await requireStylist();
  if (!auth.ok) return auth.response;

  const supabase = await supabaseServer();
  const { data: stylist } = await supabase
    .from("stylists")
    .select("id, stripe_account_id")
    .eq("profile_id", auth.user.id)
    .maybeSingle();
  if (!stylist) return NextResponse.json({ error: "Create your stylist profile first." }, { status: 409 });

  try {
    let accountId = stylist.stripe_account_id as string | null;
    if (!accountId) {
      accountId = await createConnectAccount(auth.user.email);
      await supabaseAdmin().from("stylists").update({ stripe_account_id: accountId }).eq("id", stylist.id);
    }

    // If already fully onboarded, return a dashboard login link instead.
    if (await accountPayoutsEnabled(accountId)) {
      await supabaseAdmin().from("stylists").update({ payouts_enabled: true, onboarding_complete: true }).eq("id", stylist.id);
      return NextResponse.json({ url: await createLoginLink(accountId), mode: "dashboard" });
    }

    return NextResponse.json({ url: await createAccountLink(accountId), mode: "onboarding" });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Stripe Connect is not configured." },
      { status: 500 }
    );
  }
}

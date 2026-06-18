// Resolves a stylist by slug, merging the static catalogue with any onboarded
// stylist account in the database (Stripe account, commission rate, payouts).
import "server-only";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getStylist as getStaticStylist, getService } from "@/lib/data";

export interface ResolvedStylist {
  slug: string;
  name: string;
  accountId: string | null; // stylists.id when an account exists
  stripeAccountId: string | null;
  payoutsEnabled: boolean;
  commissionRate: number; // fraction taken as platform commission
}

interface StylistAccount {
  id: string;
  stripe_account_id: string | null;
  payouts_enabled: boolean;
  commission_rate: number;
  display_name: string;
}

export async function resolveStylist(slug: string): Promise<ResolvedStylist | null> {
  const staticEntry = getStaticStylist(slug);

  let account: StylistAccount | null = null;

  try {
    const { data } = await supabaseAdmin()
      .from("stylists")
      .select("id, stripe_account_id, payouts_enabled, commission_rate, display_name")
      .eq("slug", slug)
      .maybeSingle();
    account = (data as StylistAccount | null) ?? null;
  } catch {
    // DB not configured — fall back to the static catalogue.
  }

  if (!staticEntry && !account) return null;

  return {
    slug,
    name: account?.display_name ?? staticEntry?.name ?? "Stylist",
    accountId: account?.id ?? null,
    stripeAccountId: account?.stripe_account_id ?? null,
    payoutsEnabled: Boolean(account?.payouts_enabled),
    commissionRate: account?.commission_rate ?? 0.2,
  };
}

export { getService };

// Stripe helpers. The client is lazily created so a missing key doesn't break
// the build, and pricing maths lives here so the breakdown is consistent
// everywhere (checkout, dashboards, receipts).

import Stripe from "stripe";

export const PLATFORM_FEE_RATE = 0.05; // 5% platform fee added on top

let stripe: Stripe | null = null;

/** Whether Stripe is configured (secret key present). */
export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function getStripe(): Stripe {
  if (stripe) return stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      "Missing STRIPE_SECRET_KEY. Add it to your .env.local (see .env.example)."
    );
  }
  stripe = new Stripe(key, {
    // Pin to the SDK's bundled API version.
    apiVersion: "2025-02-24.acacia",
    typescript: true,
  });
  return stripe;
}

export interface PriceBreakdown {
  /** Base service price in GBP. */
  base: number;
  /** Platform fee in GBP. */
  fee: number;
  /** Total charged to the client in GBP. */
  total: number;
  /** Total in pence for Stripe. */
  totalPence: number;
}

/** Adds the 5% platform fee to a base price and returns the full breakdown. */
export function priceBreakdown(base: number): PriceBreakdown {
  const fee = Math.round(base * PLATFORM_FEE_RATE * 100) / 100;
  const total = Math.round((base + fee) * 100) / 100;
  return {
    base: round2(base),
    fee,
    total,
    totalPence: toPence(total),
  };
}

/** Converts a GBP amount to integer pence for the Stripe API. */
export function toPence(amount: number): number {
  return Math.round(amount * 100);
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Formats a GBP amount for display, e.g. £140.00. */
export function formatGBP(amount: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(amount);
}

// ─────────────────────────── Stripe Connect ─────────────────────────────────
// Stylists are paid via Connect Express accounts. The platform takes an
// application fee equal to the client service fee plus the tier commission, and
// the remainder is transferred to the connected stylist account.

const APP_URL = () => process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

/** Creates (or returns) an Express connected account for a stylist. */
export async function createConnectAccount(email: string, country = "GB"): Promise<string> {
  const account = await getStripe().accounts.create({
    type: "express",
    email,
    country,
    capabilities: {
      transfers: { requested: true },
      card_payments: { requested: true },
    },
    business_type: "individual",
    metadata: { platform: "styleup" },
  });
  return account.id;
}

/** Generates an onboarding link the stylist follows to finish KYC + payouts. */
export async function createAccountLink(accountId: string): Promise<string> {
  const link = await getStripe().accountLinks.create({
    account: accountId,
    refresh_url: `${APP_URL()}/stylist-dashboard?connect=refresh`,
    return_url: `${APP_URL()}/stylist-dashboard?connect=done`,
    type: "account_onboarding",
  });
  return link.url;
}

/** Returns whether a connected account can receive payouts. */
export async function accountPayoutsEnabled(accountId: string): Promise<boolean> {
  const account = await getStripe().accounts.retrieve(accountId);
  return Boolean(account.payouts_enabled && account.charges_enabled);
}

/** A dashboard login link so stylists can manage their Stripe account. */
export async function createLoginLink(accountId: string): Promise<string> {
  const link = await getStripe().accounts.createLoginLink(accountId);
  return link.url;
}

/** Issues a (possibly partial) refund against a payment intent. */
export async function refundPaymentIntent(
  paymentIntentId: string,
  amount?: number
): Promise<Stripe.Refund> {
  return getStripe().refunds.create({
    payment_intent: paymentIntentId,
    ...(amount != null ? { amount: toPence(amount) } : {}),
    reverse_transfer: true,
    refund_application_fee: true,
  });
}

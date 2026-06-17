// Stripe helpers. The client is lazily created so a missing key doesn't break
// the build, and pricing maths lives here so the breakdown is consistent
// everywhere (checkout, dashboards, receipts).

import Stripe from "stripe";

export const PLATFORM_FEE_RATE = 0.05; // 5% platform fee added on top

let stripe: Stripe | null = null;

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

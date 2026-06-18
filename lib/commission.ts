// Marketplace commission model. A stylist's rate is determined by their volume
// of completed sessions in the trailing month. Lower commission rewards growth.

export interface CommissionTier {
  name: "Starter" | "Silver" | "Gold" | "Elite";
  rate: number; // platform commission as a fraction of the base service price
  minMonthlySessions: number;
}

export const COMMISSION_TIERS: CommissionTier[] = [
  { name: "Elite", rate: 0.1, minMonthlySessions: 30 },
  { name: "Gold", rate: 0.12, minMonthlySessions: 15 },
  { name: "Silver", rate: 0.15, minMonthlySessions: 5 },
  { name: "Starter", rate: 0.2, minMonthlySessions: 0 },
];

export function tierForMonthlySessions(monthlySessions: number): CommissionTier {
  return (
    COMMISSION_TIERS.find((t) => monthlySessions >= t.minMonthlySessions) ??
    COMMISSION_TIERS[COMMISSION_TIERS.length - 1]
  );
}

export interface Split {
  base: number; // service price the client pays for the work
  platformFee: number; // commission the platform keeps (in major units)
  stylistEarnings: number; // amount transferred to the stylist
}

/**
 * Splits a base price between the platform and the stylist using the tier rate.
 * Amounts are rounded to 2 dp.
 */
export function commissionSplit(base: number, rate: number): Split {
  const platformFee = Math.round(base * rate * 100) / 100;
  const stylistEarnings = Math.round((base - platformFee) * 100) / 100;
  return { base: Math.round(base * 100) / 100, platformFee, stylistEarnings };
}

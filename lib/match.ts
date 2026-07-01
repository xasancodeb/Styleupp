// Personal match scoring: how well a stylist fits what we know about the
// visitor (colour season, location, stylist-gender preference, budget).
// Deterministic and client-side so results are instant and identical across
// renders. Scores land in a believable 68–99 band.

import { genderOf, proximity, type Stylist } from "./data";
import type { ClientProfile } from "./profile";

export interface Match {
  score: number;
  reasons: string[];
}

export function matchScore(s: Stylist, p: ClientProfile): Match {
  let score = 70;
  const reasons: string[] = [];

  // Colour season known → colour-led stylists rank up.
  if (p.season) {
    if (s.specialties.includes("Colour Analysis")) {
      score += 9;
      reasons.push("Colour specialist for your season");
    } else {
      score += 3;
    }
  }

  // Reachability: someone you can actually meet beats a remote match.
  const prox = proximity(s, p.location?.country ?? null, p.location?.city ?? null);
  if (prox === "same-city") {
    score += 10;
    reasons.push(`Based in ${s.city}, near you`);
  } else if (prox === "same-country") {
    score += 8;
    reasons.push("In your country");
  } else if (prox === "same-region") {
    score += 5;
    reasons.push("In your region");
  }

  // Preferred stylist gender.
  if (p.preferences.stylistGender && genderOf(s) === p.preferences.stylistGender) {
    score += 6;
    reasons.push("Matches your stylist preference");
  }

  // Budget fit.
  const b = p.preferences.budget;
  if (b === "value" && s.startingPrice <= 90) score += 4;
  if (b === "mid" && s.startingPrice > 85 && s.startingPrice <= 110) score += 4;
  if (b === "premium" && s.startingPrice > 105) score += 4;

  // Track record nudges the tail.
  score += Math.round((s.rating - 4.8) * 20);
  if (s.reviewCount > 150) score += 1;

  return { score: Math.max(68, Math.min(99, score)), reasons: reasons.slice(0, 2) };
}

/** True when we know enough about the visitor for scores to mean something. */
export function canMatch(p: ClientProfile): boolean {
  return Boolean(p.season || p.location?.country || p.preferences.stylistGender);
}

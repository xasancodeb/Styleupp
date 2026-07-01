// Client-side profile + colour analysis helpers. The profile and quiz results
// are persisted in localStorage so the demo works without a backend round-trip;
// the same shape mirrors the Supabase `profiles` table.

export type ColorSeason = "spring" | "summer" | "autumn" | "winter";

export interface ClientProfile {
  fullName: string;
  email: string;
  archetype: string | null;
  season: ColorSeason | null;
  location: { city: string; country: string } | null;
  /** Open to stylists anywhere over video, rather than only those near me. */
  international: boolean;
  preferences: {
    budget: "value" | "mid" | "premium" | null;
    sessionType: "virtual" | "in-person" | "hybrid" | null;
    /** Preferred gender of the stylist; null means no preference. */
    stylistGender: "female" | "male" | null;
    goals: string[];
  };
  updatedAt: string;
}

export interface Palette {
  season: ColorSeason;
  name: string;
  tagline: string;
  description: string;
  bestColors: { name: string; hex: string }[];
  avoidColors: { name: string; hex: string }[];
  metals: string[];
  neutrals: { name: string; hex: string }[];
}

export const PALETTES: Record<ColorSeason, Palette> = {
  spring: {
    season: "spring",
    name: "Warm Spring",
    tagline: "Fresh, warm and luminous.",
    description:
      "Spring colouring is warm and clear. You shine in fresh, bright shades with golden undertones that mirror the light of early spring. Keep things crisp and avoid anything too muted or icy.",
    bestColors: [
      { name: "Coral", hex: "#FF7F50" },
      { name: "Warm Peach", hex: "#FFB07C" },
      { name: "Golden Yellow", hex: "#FFC75F" },
      { name: "Apple Green", hex: "#9ACD32" },
      { name: "Turquoise", hex: "#40E0D0" },
      { name: "Warm Periwinkle", hex: "#8A7FE0" },
    ],
    avoidColors: [
      { name: "Black", hex: "#1A1612" },
      { name: "Icy Pink", hex: "#F4C2D7" },
      { name: "Cool Grey", hex: "#9AA0A6" },
    ],
    metals: ["Gold", "Rose gold", "Bronze"],
    neutrals: [
      { name: "Warm Ivory", hex: "#F6EFE2" },
      { name: "Camel", hex: "#C19A6B" },
      { name: "Warm Navy", hex: "#33405B" },
    ],
  },
  summer: {
    season: "summer",
    name: "Cool Summer",
    tagline: "Soft, cool and elegant.",
    description:
      "Summer colouring is cool and gentle. Soft, dusky shades with blue undertones flatter you most. Think of a hazy summer evening: muted, romantic and never harsh.",
    bestColors: [
      { name: "Dusty Rose", hex: "#C9A0A6" },
      { name: "Soft Lavender", hex: "#B8A9D6" },
      { name: "Powder Blue", hex: "#A7C7E7" },
      { name: "Sage", hex: "#9CAF88" },
      { name: "Mauve", hex: "#A56B8C" },
      { name: "Slate Teal", hex: "#5F8A8B" },
    ],
    avoidColors: [
      { name: "Orange", hex: "#FF7F50" },
      { name: "Tomato Red", hex: "#E04A2F" },
      { name: "Golden Yellow", hex: "#FFC75F" },
    ],
    metals: ["Silver", "White gold", "Platinum"],
    neutrals: [
      { name: "Soft White", hex: "#F2F0EC" },
      { name: "Taupe", hex: "#B0A492" },
      { name: "Cool Navy", hex: "#2E3A59" },
    ],
  },
  autumn: {
    season: "autumn",
    name: "Deep Autumn",
    tagline: "Rich, warm and earthy.",
    description:
      "Autumn colouring is warm and muted with depth. You glow in rich, earthy shades: the colours of turning leaves, spice and warm metals. Steer clear of cool pastels and stark contrasts.",
    bestColors: [
      { name: "Rust", hex: "#B7410E" },
      { name: "Olive", hex: "#708238" },
      { name: "Mustard", hex: "#D4A017" },
      { name: "Terracotta", hex: "#C66B3D" },
      { name: "Forest Green", hex: "#2F5D3A" },
      { name: "Teal", hex: "#2C6E6E" },
    ],
    avoidColors: [
      { name: "Icy Blue", hex: "#CFE8F3" },
      { name: "Fuchsia", hex: "#D6336C" },
      { name: "Pure White", hex: "#FFFFFF" },
    ],
    metals: ["Gold", "Bronze", "Copper"],
    neutrals: [
      { name: "Cream", hex: "#EFE6D2" },
      { name: "Chocolate", hex: "#4B3621" },
      { name: "Khaki", hex: "#8F8662" },
    ],
  },
  winter: {
    season: "winter",
    name: "Cool Winter",
    tagline: "Bold, cool and high-contrast.",
    description:
      "Winter colouring is cool and clear with high contrast. You can carry the boldest, purest shades and true neutrals like black and white. Embrace drama, because muted, dusty tones will wash you out.",
    bestColors: [
      { name: "True Red", hex: "#C8102E" },
      { name: "Royal Blue", hex: "#1F3FB5" },
      { name: "Emerald", hex: "#10693E" },
      { name: "Magenta", hex: "#C2185B" },
      { name: "Icy Violet", hex: "#9B6BD6" },
      { name: "Cobalt", hex: "#0047AB" },
    ],
    avoidColors: [
      { name: "Mustard", hex: "#D4A017" },
      { name: "Rust", hex: "#B7410E" },
      { name: "Warm Beige", hex: "#D8C3A5" },
    ],
    metals: ["Silver", "Platinum", "White gold"],
    neutrals: [
      { name: "Pure White", hex: "#FFFFFF" },
      { name: "True Black", hex: "#1A1612" },
      { name: "Charcoal", hex: "#36454F" },
    ],
  },
};

export interface QuizOption {
  label: string;
  // Each option contributes points to one or more seasons.
  scores: Partial<Record<ColorSeason, number>>;
  /** Optional colour swatches rendered with the option (visual questions). */
  swatches?: string[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  helper?: string;
  options: QuizOption[];
  /** Non-scoring question whose answer is stored as a styling goal. */
  goal?: boolean;
}

export const SEASON_QUIZ: QuizQuestion[] = [
  {
    id: "vein",
    question: "Look at the veins on your inner wrist. What colour are they?",
    helper: "Natural daylight gives the truest read.",
    options: [
      { label: "Greenish", scores: { spring: 2, autumn: 2 } },
      { label: "Bluish or purple", scores: { summer: 2, winter: 2 } },
      { label: "A mix of both", scores: { spring: 1, summer: 1, autumn: 1, winter: 1 } },
    ],
  },
  {
    id: "jewellery",
    question: "Which metal makes your skin look healthiest?",
    options: [
      { label: "Gold", scores: { spring: 2, autumn: 2 }, swatches: ["#D4AF37", "#E8C874"] },
      { label: "Silver", scores: { summer: 2, winter: 2 }, swatches: ["#C0C0C8", "#E6E8EB"] },
      { label: "Both look good", scores: { spring: 1, summer: 1, autumn: 1, winter: 1 }, swatches: ["#D4AF37", "#C0C0C8"] },
    ],
  },
  {
    id: "hair",
    question: "What's your natural hair colour?",
    helper: "The colour you had in your twenties, before any dye.",
    options: [
      { label: "Golden or strawberry blonde", scores: { spring: 3 }, swatches: ["#D9A85C", "#C98A5E"] },
      { label: "Ash blonde or mousy brown", scores: { summer: 3 }, swatches: ["#B4A284", "#8C7B66"] },
      { label: "Warm brown, auburn or red", scores: { autumn: 3 }, swatches: ["#6B3F26", "#8E3B1F"] },
      { label: "Dark brown or black", scores: { winter: 3 }, swatches: ["#2E2118", "#141210"] },
    ],
  },
  {
    id: "eyes",
    question: "And your eye colour?",
    options: [
      { label: "Warm brown or amber", scores: { spring: 1, autumn: 2 }, swatches: ["#8B5A2B", "#B07A3F"] },
      { label: "Hazel or warm green", scores: { autumn: 2, spring: 1 }, swatches: ["#7C7A46", "#5C6B3C"] },
      { label: "Blue, grey or soft green", scores: { summer: 2, winter: 1 }, swatches: ["#7FA6C9", "#9AA8AC"] },
      { label: "Deep brown or near-black", scores: { winter: 2 }, swatches: ["#3E2A20", "#1F1712"] },
    ],
  },
  {
    id: "contrast",
    question: "How much contrast is there between your hair, skin and eyes?",
    options: [
      { label: "High: dark hair, light skin or bright eyes", scores: { winter: 3 } },
      { label: "Low and soft, everything blends", scores: { summer: 3 } },
      { label: "Warm and medium", scores: { autumn: 2, spring: 1 } },
      { label: "Light and bright", scores: { spring: 3 } },
    ],
  },
  {
    id: "sun",
    question: "How does your skin react to the sun?",
    options: [
      { label: "Tans easily to a golden brown", scores: { spring: 1, autumn: 2 } },
      { label: "Burns first, then tans lightly", scores: { summer: 2 } },
      { label: "Burns and rarely tans", scores: { winter: 2, summer: 1 } },
      { label: "Tans quickly and deeply", scores: { autumn: 2, winter: 1 } },
    ],
  },
  {
    id: "white",
    question: "Which white is more flattering against your face?",
    options: [
      { label: "Soft, creamy ivory", scores: { spring: 2, autumn: 2 } },
      { label: "Crisp, pure white", scores: { summer: 1, winter: 2 } },
    ],
  },
  {
    id: "best-colour",
    question: "Which group of colours gets you the most compliments?",
    helper: "Trust the swatches, not the names.",
    options: [
      { label: "Coral, peach, warm green", scores: { spring: 3 }, swatches: ["#FF7F50", "#FFB07C", "#9ACD32"] },
      { label: "Dusty rose, lavender, soft blue", scores: { summer: 3 }, swatches: ["#C9A0A6", "#B8A9D6", "#A7C7E7"] },
      { label: "Rust, olive, mustard", scores: { autumn: 3 }, swatches: ["#B7410E", "#708238", "#D4A017"] },
      { label: "True red, royal blue, emerald", scores: { winter: 3 }, swatches: ["#C8102E", "#1F3FB5", "#10693E"] },
    ],
  },
  {
    id: "goal",
    goal: true,
    question: "Last one: what brings you here?",
    helper: "This doesn't change your season. It helps us match you with the right stylist.",
    options: [
      { label: "I want to know my colours", scores: {} },
      { label: "Rebuild my wardrobe properly", scores: {} },
      { label: "A big occasion is coming up", scores: {} },
      { label: "Level up how I show up at work", scores: {} },
    ],
  },
];

export function determineSeason(answers: Record<string, number>): ColorSeason {
  const totals: Record<ColorSeason, number> = { spring: 0, summer: 0, autumn: 0, winter: 0 };
  for (const question of SEASON_QUIZ) {
    const choiceIndex = answers[question.id];
    if (choiceIndex == null) continue;
    const option = question.options[choiceIndex];
    if (!option) continue;
    for (const [season, points] of Object.entries(option.scores)) {
      totals[season as ColorSeason] += points ?? 0;
    }
  }
  let winner: ColorSeason = "spring";
  let best = -1;
  (Object.keys(totals) as ColorSeason[]).forEach((season) => {
    if (totals[season] > best) {
      best = totals[season];
      winner = season;
    }
  });
  return winner;
}

const PROFILE_KEY = "styleup.profile";

function emptyProfile(): ClientProfile {
  return {
    fullName: "",
    email: "",
    archetype: null,
    season: null,
    location: null,
    international: false,
    preferences: { budget: null, sessionType: null, stylistGender: null, goals: [] },
    updatedAt: new Date().toISOString(),
  };
}

export function loadProfile(): ClientProfile {
  if (typeof window === "undefined") return emptyProfile();
  try {
    const raw = window.localStorage.getItem(PROFILE_KEY);
    if (!raw) return emptyProfile();
    return { ...emptyProfile(), ...(JSON.parse(raw) as Partial<ClientProfile>) };
  } catch {
    return emptyProfile();
  }
}

export function saveProfile(profile: Partial<ClientProfile>): ClientProfile {
  const next: ClientProfile = {
    ...loadProfile(),
    ...profile,
    updatedAt: new Date().toISOString(),
  };
  if (typeof window !== "undefined") {
    window.localStorage.setItem(PROFILE_KEY, JSON.stringify(next));
  }
  return next;
}

export function saveSeason(season: ColorSeason): ClientProfile {
  return saveProfile({ season });
}

export function saveLocation(location: ClientProfile["location"]): ClientProfile {
  return saveProfile({ location });
}

export function saveInternational(international: boolean): ClientProfile {
  return saveProfile({ international });
}

export function saveStylistGender(stylistGender: "female" | "male" | null): ClientProfile {
  const current = loadProfile();
  return saveProfile({ preferences: { ...current.preferences, stylistGender } });
}

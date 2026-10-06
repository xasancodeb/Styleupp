/**
 * Shared vocabulary for the wardrobe. The AI pass, the API routes and the UI
 * all speak these exact strings, so the model can never invent a category the
 * interface cannot render.
 */

export const CATEGORIES = [
  "top",
  "bottom",
  "dress",
  "outerwear",
  "shoes",
  "bag",
  "accessory",
] as const;
export type Category = (typeof CATEGORIES)[number];

export const FORMALITY = ["casual", "smart casual", "business", "formal"] as const;
export type Formality = (typeof FORMALITY)[number];

export const WARMTH = ["lightweight", "mid-weight", "warm"] as const;
export type Warmth = (typeof WARMTH)[number];

/** What a session is for. Drives the outfit brief. */
export const OCCASIONS = [
  { key: "work", label: "A day at work" },
  { key: "dinner", label: "Dinner out" },
  { key: "weekend", label: "Weekend, off duty" },
  { key: "event", label: "An event or wedding" },
  { key: "travel", label: "Travelling" },
  { key: "date", label: "A date" },
] as const;
export type OccasionKey = (typeof OCCASIONS)[number]["key"];

export interface WardrobeItem {
  id: string;
  imageUrl: string;
  name: string;
  category: Category;
  colorName: string | null;
  colorHex: string | null;
  pattern: string | null;
  formality: Formality | null;
  warmth: Warmth | null;
  notes: string | null;
  createdAt: string;
}

export interface Outfit {
  id: string;
  title: string;
  occasion: string;
  rationale: string | null;
  missingPiece: string | null;
  itemIds: string[];
  createdAt: string;
}

/** Plural label for a category, for headings and empty states. */
export function categoryLabel(category: Category): string {
  return category === "accessory" ? "Accessories" : `${category[0].toUpperCase()}${category.slice(1)}s`;
}

export function occasionLabel(key: string): string {
  return OCCASIONS.find((o) => o.key === key)?.label ?? key;
}

/** Rows from Supabase carry snake_case; the app speaks camelCase. */
type ItemRow = {
  id: string;
  image_url: string;
  name: string;
  category: string;
  color_name: string | null;
  color_hex: string | null;
  pattern: string | null;
  formality: string | null;
  warmth: string | null;
  notes: string | null;
  created_at: string;
};

export function toItem(row: ItemRow): WardrobeItem {
  return {
    id: row.id,
    imageUrl: row.image_url,
    name: row.name,
    category: (CATEGORIES as readonly string[]).includes(row.category)
      ? (row.category as Category)
      : "accessory",
    colorName: row.color_name,
    colorHex: row.color_hex,
    pattern: row.pattern,
    formality: row.formality as Formality | null,
    warmth: row.warmth as Warmth | null,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

type OutfitRow = {
  id: string;
  title: string;
  occasion: string;
  rationale: string | null;
  missing_piece: string | null;
  item_ids: string[];
  created_at: string;
};

export function toOutfit(row: OutfitRow): Outfit {
  return {
    id: row.id,
    title: row.title,
    occasion: row.occasion,
    rationale: row.rationale,
    missingPiece: row.missing_piece,
    itemIds: row.item_ids ?? [],
    createdAt: row.created_at,
  };
}

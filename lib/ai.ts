/**
 * The styling intelligence.
 *
 * Two calls into Claude, both with structured outputs so the response is
 * schema-valid JSON rather than prose we have to parse:
 *
 *   analyseGarment  — vision: a photo of one item becomes a catalogued garment.
 *   buildOutfits    — reasoning: a wardrobe plus a colour season becomes
 *                     outfits made only from clothes the person owns.
 *
 * Everything the model returns is treated as untrusted: ids are checked
 * against the real wardrobe before they reach the database, and enum-ish
 * fields are narrowed to the vocabulary in lib/wardrobe.ts.
 */
import Anthropic from "@anthropic-ai/sdk";
// The SDK's structured-output helper is built against Zod 4, which ships
// inside zod 3.25 on this subpath. The rest of the app's schemas stay on the
// v3 import in lib/validation.ts; the two coexist without interfering.
import { z } from "zod/v4";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { CATEGORIES, FORMALITY, WARMTH, type WardrobeItem } from "@/lib/wardrobe";
import { PALETTES, type ColorSeason } from "@/lib/profile";

const MODEL = "claude-opus-5-5";

/** The feature degrades to a clear message rather than a crash when unset. */
export function isAIConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

let client: Anthropic | null = null;
function anthropic(): Anthropic {
  if (!client) client = new Anthropic();
  return client;
}

// ─────────────────────────── garment analysis ────────────────────────────

const GarmentSchema = z.object({
  name: z
    .string()
    .describe("Short, natural name a person would use, e.g. 'charcoal wool blazer'. Max 6 words."),
  category: z.enum(CATEGORIES).describe("Which kind of garment this is."),
  colorName: z.string().describe("The dominant colour in plain words, e.g. 'navy' or 'camel'."),
  colorHex: z
    .string()
    .describe("The dominant colour as a #rrggbb hex value, sampled from the garment itself."),
  pattern: z
    .string()
    .describe("Pattern or texture, e.g. 'solid', 'pinstripe', 'cable knit', 'floral'."),
  formality: z.enum(FORMALITY).describe("How dressed-up the piece is."),
  warmth: z.enum(WARMTH).describe("How warm it is to wear."),
  notes: z
    .string()
    .describe("One short sentence on cut, fabric or how it is best worn. No more than 20 words."),
});

export type GarmentAnalysis = z.infer<typeof GarmentSchema>;

const GARMENT_SYSTEM = `You catalogue clothing for a personal styling service.

You are shown one photograph of a single garment or accessory. Describe only
what is actually visible. Judge the colour from the fabric itself, ignoring
the lighting, background or any skin tone in the shot.

If the photo shows a person wearing several things, catalogue the single most
prominent garment. If the image contains no clothing at all, return the
category that fits best and say so plainly in notes.

Be specific and sound like a stylist, not a product database: "faded indigo
straight-leg jeans", never "blue denim bottoms, item".`;

/** Read one garment photo into a catalogued item. */
export async function analyseGarment(
  imageBase64: string,
  mediaType: "image/jpeg" | "image/png" | "image/webp"
): Promise<GarmentAnalysis> {
  const response = await anthropic().messages.parse({
    model: MODEL,
    max_tokens: 1024,
    // A single photo is a shallow judgement; low effort keeps uploads quick.
    output_config: { effort: "low", format: zodOutputFormat(GarmentSchema) },
    system: GARMENT_SYSTEM,
    messages: [
      {
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: mediaType, data: imageBase64 } },
          { type: "text", text: "Catalogue this garment." },
        ],
      },
    ],
  });

  const parsed = response.parsed_output;
  if (!parsed) throw new Error("Could not read that photo. Try a clearer, closer shot.");
  return normaliseGarment(parsed);
}

/** Keep hex values renderable even if the model returns an odd shape. */
function normaliseGarment(g: GarmentAnalysis): GarmentAnalysis {
  const hex = /^#[0-9a-fA-F]{6}$/.test(g.colorHex) ? g.colorHex.toLowerCase() : "#9ca3af";
  return { ...g, colorHex: hex, name: g.name.slice(0, 80), notes: g.notes.slice(0, 160) };
}

// ──────────────────────────── outfit building ─────────────────────────────

const OutfitSchema = z.object({
  outfits: z
    .array(
      z.object({
        title: z
          .string()
          .describe("A short evocative name for the look, e.g. 'Quiet authority'. Max 4 words."),
        itemIds: z
          .array(z.string())
          .describe("The ids of the wardrobe items in this outfit. Use only ids from the list given."),
        rationale: z
          .string()
          .describe(
            "Two or three sentences, spoken to the wearer as 'you', on why these pieces work together and why the colours suit them."
          ),
        missingPiece: z
          .string()
          .describe(
            "One piece they do not own that would lift this outfit, with the colour named. Empty string if the look needs nothing."
          ),
      })
    )
    .describe("Three distinct outfits, each using different items where possible."),
});

export interface OutfitDraft {
  title: string;
  itemIds: string[];
  rationale: string;
  missingPiece: string | null;
}

interface BuildArgs {
  items: WardrobeItem[];
  season: ColorSeason | null;
  occasion: string;
  notes?: string;
}

/**
 * Build outfits from a real wardrobe. Returns only outfits whose items all
 * exist, so a hallucinated id can never reach the database or the UI.
 */
export async function buildOutfits({ items, season, occasion, notes }: BuildArgs): Promise<OutfitDraft[]> {
  const palette = season ? PALETTES[season] : null;

  // The wardrobe as a compact catalogue. Ids are what the model must cite.
  const catalogue = items
    .map(
      (i) =>
        `- id:${i.id} | ${i.name} | ${i.category} | ${i.colorName ?? "unknown colour"}` +
        `${i.pattern ? ` | ${i.pattern}` : ""}${i.formality ? ` | ${i.formality}` : ""}` +
        `${i.warmth ? ` | ${i.warmth}` : ""}`
    )
    .join("\n");

  const seasonBrief = palette
    ? `Their colour season is ${palette.name}. ${palette.description}
Colours that flatter them: ${palette.bestColors.map((c) => c.name).join(", ")}.
Their neutrals: ${palette.neutrals.map((c) => c.name).join(", ")}.
Colours to avoid near the face: ${palette.avoidColors.map((c) => c.name).join(", ")}.
Their metals: ${palette.metals.join(" and ")}.`
    : "They have not had their colours analysed yet, so judge colour harmony on general principles and do not claim to know their season.";

  const system = `You are a senior personal stylist building outfits from a client's own wardrobe.

${seasonBrief}

Absolute rules:
- Use ONLY the item ids listed by the client. Never invent an id, and never
  include a piece they do not own in itemIds.
- Every outfit must be wearable: at minimum something on top and something on
  the bottom, or a dress. Add shoes and a layer when they own suitable ones.
- Make the three outfits genuinely different from each other. Do not return
  the same combination twice with a different name.
- If the wardrobe is too sparse for three complete outfits, return fewer good
  ones rather than padding with combinations that do not work.
- Speak to them directly as "you". Be specific about why a colour suits them.
  No filler, no flattery, no em dashes.
- In missingPiece, name one genuinely useful gap with its colour. If nothing
  is missing, return an empty string.`;

  const userText = `Here is my wardrobe:

${catalogue}

Build outfits for: ${occasion}.${notes ? `\n\nAlso bear in mind: ${notes}` : ""}`;

  const response = await anthropic().messages.parse({
    model: MODEL,
    max_tokens: 4096,
    // Combining colour theory with a real inventory is the reasoning-heavy
    // half of the product, so this is worth more effort than the vision pass.
    output_config: { effort: "high", format: zodOutputFormat(OutfitSchema) },
    system,
    messages: [{ role: "user", content: userText }],
  });

  const parsed = response.parsed_output;
  if (!parsed) throw new Error("Could not put together outfits just now. Please try again.");

  const owned = new Set(items.map((i) => i.id));
  return parsed.outfits
    .map((o) => ({
      title: o.title.slice(0, 60),
      // Drop anything not actually in the wardrobe, and de-duplicate.
      itemIds: [...new Set(o.itemIds)].filter((id) => owned.has(id)),
      rationale: o.rationale,
      missingPiece: o.missingPiece?.trim() ? o.missingPiece.trim().slice(0, 160) : null,
    }))
    // An outfit stripped down to one piece by that filter is not an outfit.
    .filter((o) => o.itemIds.length >= 2);
}

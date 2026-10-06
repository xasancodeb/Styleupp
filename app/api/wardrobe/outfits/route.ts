import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";
import { parseBody } from "@/lib/validation";
import { buildOutfits, isAIConfigured } from "@/lib/ai";
import { toItem, toOutfit, OCCASIONS } from "@/lib/wardrobe";

export const dynamic = "force-dynamic";

const OCCASION_KEYS = OCCASIONS.map((o) => o.key) as [string, ...string[]];

const generateSchema = z.object({
  occasion: z.enum(OCCASION_KEYS),
  notes: z.string().max(300).optional(),
});

// GET /api/wardrobe/outfits — previously generated looks, newest first.
export async function GET() {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("outfits")
    .select("*")
    .eq("profile_id", auth.user.id)
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ outfits: (data ?? []).map(toOutfit) });
}

// POST /api/wardrobe/outfits — build outfits from what they actually own.
export async function POST(request: Request) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  if (!isAIConfigured()) {
    return NextResponse.json(
      { error: "Outfit building is not switched on yet. ANTHROPIC_API_KEY is missing." },
      { status: 503 }
    );
  }

  const parsed = await parseBody(request, generateSchema);
  if (!parsed.ok) return parsed.response;

  const supabase = await supabaseServer();

  // profiles.color_season is the current season, kept up to date by the quiz;
  // color_season_results is only the history behind it.
  const [{ data: itemRows }, { data: profileRow }] = await Promise.all([
    supabase.from("wardrobe_items").select("*").eq("profile_id", auth.user.id),
    supabase.from("profiles").select("color_season").eq("id", auth.user.id).maybeSingle(),
  ]);

  const items = (itemRows ?? []).map(toItem);
  if (items.length < 3) {
    return NextResponse.json(
      { error: "Add at least three pieces and we can start putting looks together." },
      { status: 400 }
    );
  }

  const occasion = OCCASIONS.find((o) => o.key === parsed.data.occasion)!;

  let drafts;
  try {
    drafts = await buildOutfits({
      items,
      season: (profileRow?.color_season as never) ?? null,
      occasion: occasion.label,
      notes: parsed.data.notes,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not build outfits.";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  if (drafts.length === 0) {
    return NextResponse.json(
      { error: "There isn't quite enough here to build a full look yet. Try adding shoes or a layer." },
      { status: 422 }
    );
  }

  const { data, error } = await supabase
    .from("outfits")
    .insert(
      drafts.map((d) => ({
        profile_id: auth.user.id,
        title: d.title,
        occasion: parsed.data.occasion,
        rationale: d.rationale,
        missing_piece: d.missingPiece,
        item_ids: d.itemIds,
      }))
    )
    .select("*");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ outfits: (data ?? []).map(toOutfit) }, { status: 201 });
}

// DELETE /api/wardrobe/outfits?id=... — discard a saved look.
export async function DELETE(request: Request) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required." }, { status: 400 });

  const supabase = await supabaseServer();
  const { error } = await supabase
    .from("outfits")
    .delete()
    .eq("id", id)
    .eq("profile_id", auth.user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ deleted: true });
}

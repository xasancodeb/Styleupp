import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";
import { parseBody, colorResultSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

// POST /api/profile/color-season — persist a quiz result (history + current).
export async function POST(request: Request) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  const parsed = await parseBody(request, colorResultSchema);
  if (!parsed.ok) return parsed.response;
  const { season, answers } = parsed.data;

  const supabase = await supabaseServer();
  await supabase.from("color_season_results").insert({
    profile_id: auth.user.id,
    season,
    answers,
  });
  await supabase.from("profiles").update({ color_season: season }).eq("id", auth.user.id);

  return NextResponse.json({ season }, { status: 201 });
}

// GET /api/profile/color-season — result history.
export async function GET() {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;
  const supabase = await supabaseServer();
  const { data } = await supabase
    .from("color_season_results")
    .select("*")
    .eq("profile_id", auth.user.id)
    .order("created_at", { ascending: false });
  return NextResponse.json({ results: data ?? [] });
}

import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";
import { parseBody, savedStylistSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

// GET /api/saved-stylists — slugs the user has saved.
export async function GET() {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;
  const supabase = await supabaseServer();
  const { data } = await supabase
    .from("saved_stylists")
    .select("stylist_slug, created_at")
    .eq("profile_id", auth.user.id)
    .order("created_at", { ascending: false });
  return NextResponse.json({ saved: (data ?? []).map((r) => r.stylist_slug) });
}

// POST /api/saved-stylists — save a stylist (idempotent).
export async function POST(request: Request) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;
  const parsed = await parseBody(request, savedStylistSchema);
  if (!parsed.ok) return parsed.response;

  const supabase = await supabaseServer();
  const { error } = await supabase
    .from("saved_stylists")
    .upsert(
      { profile_id: auth.user.id, stylist_slug: parsed.data.stylistSlug },
      { onConflict: "profile_id,stylist_slug" }
    );
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ saved: true }, { status: 201 });
}

// DELETE /api/saved-stylists?slug=... — unsave.
export async function DELETE(request: Request) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;
  const slug = new URL(request.url).searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "slug is required." }, { status: 400 });

  const supabase = await supabaseServer();
  await supabase
    .from("saved_stylists")
    .delete()
    .eq("profile_id", auth.user.id)
    .eq("stylist_slug", slug);
  return NextResponse.json({ saved: false });
}

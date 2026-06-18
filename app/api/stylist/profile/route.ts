import { NextResponse } from "next/server";
import { requireStylist } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";
import { parseBody, stylistProfileSchema } from "@/lib/validation";
import { sanitizeText } from "@/lib/sanitize";

export const dynamic = "force-dynamic";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60) || `stylist-${Math.random().toString(36).slice(2, 8)}`;
}

// GET /api/stylist/profile — the signed-in stylist's account row.
export async function GET() {
  const auth = await requireStylist();
  if (!auth.ok) return auth.response;
  const supabase = await supabaseServer();
  const { data } = await supabase
    .from("stylists")
    .select("*")
    .eq("profile_id", auth.user.id)
    .maybeSingle();
  return NextResponse.json({ stylist: data });
}

// PUT /api/stylist/profile — create or update the stylist profile.
export async function PUT(request: Request) {
  const auth = await requireStylist();
  if (!auth.ok) return auth.response;

  const parsed = await parseBody(request, stylistProfileSchema);
  if (!parsed.ok) return parsed.response;
  const d = parsed.data;

  const supabase = await supabaseServer();
  const { data: existing } = await supabase
    .from("stylists")
    .select("id, slug")
    .eq("profile_id", auth.user.id)
    .maybeSingle();

  const patch = {
    profile_id: auth.user.id,
    display_name: sanitizeText(d.displayName, 120),
    tagline: d.tagline ? sanitizeText(d.tagline, 200) : null,
    bio: d.bio ? sanitizeText(d.bio, 3000) : null,
    city: d.city ? sanitizeText(d.city, 120) : null,
    country: d.country ? sanitizeText(d.country, 120) : null,
    specialties: d.specialties ?? [],
    session_types: d.sessionTypes ?? [],
    languages: d.languages ?? [],
    starting_price: d.startingPrice ?? 0,
    portfolio_images: d.portfolioImages ?? [],
  };

  if (existing) {
    const { data, error } = await supabase
      .from("stylists")
      .update(patch)
      .eq("id", existing.id)
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ stylist: data });
  }

  // First save — generate a unique slug.
  let slug = slugify(d.displayName);
  const { data: clash } = await supabase.from("stylists").select("id").eq("slug", slug).maybeSingle();
  if (clash) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;

  const { data, error } = await supabase
    .from("stylists")
    .insert({ ...patch, slug, status: "active" })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ stylist: data }, { status: 201 });
}

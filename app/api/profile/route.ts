import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";
import { parseBody, z } from "@/lib/validation";
import { sanitizeText } from "@/lib/sanitize";

export const dynamic = "force-dynamic";

const updateProfileSchema = z.object({
  fullName: z.string().max(120).optional(),
  phone: z.string().max(40).optional(),
  archetype: z.enum(["classic", "creative", "minimalist", "romantic", "edge"]).optional(),
  colorSeason: z.enum(["spring", "summer", "autumn", "winter"]).optional(),
});

// GET /api/profile — the signed-in user's profile + style results.
export async function GET() {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, phone, role, archetype, color_season, loyalty_points, referral_code, email_verified")
    .eq("id", auth.user.id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ profile: data });
}

// PATCH /api/profile — update name/phone/archetype/colour season.
export async function PATCH(request: Request) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  const parsed = await parseBody(request, updateProfileSchema);
  if (!parsed.ok) return parsed.response;
  const { fullName, phone, archetype, colorSeason } = parsed.data;

  const patch: Record<string, unknown> = {};
  if (fullName !== undefined) patch.full_name = sanitizeText(fullName, 120);
  if (phone !== undefined) patch.phone = sanitizeText(phone, 40);
  if (archetype !== undefined) patch.archetype = archetype;
  if (colorSeason !== undefined) patch.color_season = colorSeason;

  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("profiles")
    .update(patch)
    .eq("id", auth.user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ profile: data });
}

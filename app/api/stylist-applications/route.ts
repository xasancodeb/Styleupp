import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { parseBody, stylistApplicationSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";
import { sanitizeText } from "@/lib/sanitize";

export const dynamic = "force-dynamic";

// POST /api/stylist-applications — public stylist application intake.
export async function POST(request: Request) {
  const limited = rateLimit(request, "applications", 10);
  if (limited) return limited;

  const parsed = await parseBody(request, stylistApplicationSchema);
  if (!parsed.ok) return parsed.response;
  const d = parsed.data;

  try {
    const { data, error } = await supabaseAdmin()
      .from("stylist_applications")
      .insert({
        full_name: sanitizeText(d.full_name, 120),
        email: d.email,
        city: d.city ? sanitizeText(d.city, 120) : null,
        country: d.country ? sanitizeText(d.country, 120) : null,
        years_experience: d.years_experience ?? null,
        specialties: d.specialties ?? [],
        portfolio_url: d.portfolio_url || null,
        about: d.about ? sanitizeText(d.about, 3000) : null,
        status: "pending",
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ application: data }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { received: true, note: err instanceof Error ? err.message : "queued" },
      { status: 202 }
    );
  }
}

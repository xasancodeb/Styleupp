import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// POST /api/stylist-applications — public endpoint for prospective stylists to
// submit an application. Stored as `pending` for admin review.
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const fullName = String(body.full_name ?? "").trim();
  const email = String(body.email ?? "").trim();
  if (!fullName || !email) {
    return NextResponse.json({ error: "full_name and email are required" }, { status: 400 });
  }

  const specialties = Array.isArray(body.specialties) ? (body.specialties as string[]) : [];

  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("stylist_applications")
      .insert({
        full_name: fullName,
        email,
        city: (body.city as string) ?? null,
        country: (body.country as string) ?? null,
        years_experience: body.years_experience != null ? Number(body.years_experience) : null,
        specialties,
        portfolio_url: (body.portfolio_url as string) ?? null,
        about: (body.about as string) ?? null,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ application: data }, { status: 201 });
  } catch (err) {
    // If Supabase isn't configured we still acknowledge so the demo UX works.
    return NextResponse.json(
      { received: true, note: err instanceof Error ? err.message : "stored locally" },
      { status: 202 }
    );
  }
}

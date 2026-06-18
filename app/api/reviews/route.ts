import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { supabaseServer, supabaseAdmin } from "@/lib/supabase/server";
import { parseBody, reviewSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";
import { sanitizeText } from "@/lib/sanitize";

export const dynamic = "force-dynamic";

// GET /api/reviews?slug=... — published reviews for a stylist (public).
export async function GET(request: Request) {
  const slug = new URL(request.url).searchParams.get("slug");
  if (!slug) return NextResponse.json({ reviews: [] });
  try {
    const { data } = await supabaseAdmin()
      .from("reviews")
      .select("id, rating, comment, created_at, client_id")
      .eq("stylist_id", slug)
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(50);

    const rows = data ?? [];
    // Resolve first names for display without leaking full profiles.
    const ids = Array.from(new Set(rows.map((r) => r.client_id)));
    const names = new Map<string, string>();
    if (ids.length > 0) {
      const { data: profiles } = await supabaseAdmin().from("profiles").select("id, full_name").in("id", ids);
      for (const p of profiles ?? []) {
        const first = ((p.full_name as string) ?? "").trim().split(" ")[0] || "Client";
        names.set(p.id as string, first);
      }
    }
    const reviews = rows.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      created_at: r.created_at,
      author: names.get(r.client_id as string) ?? "Client",
    }));
    return NextResponse.json({ reviews });
  } catch {
    return NextResponse.json({ reviews: [] });
  }
}

// POST /api/reviews — leave a review for a completed booking.
export async function POST(request: Request) {
  const limited = rateLimit(request, "reviews:create", 10);
  if (limited) return limited;

  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  const parsed = await parseBody(request, reviewSchema);
  if (!parsed.ok) return parsed.response;
  const { bookingId, rating, comment } = parsed.data;

  const supabase = await supabaseServer();
  const { data: booking } = await supabase
    .from("bookings")
    .select("id, stylist_id, status, client_id")
    .eq("id", bookingId)
    .eq("client_id", auth.user.id)
    .maybeSingle();

  if (!booking) return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  if (booking.status !== "completed") {
    return NextResponse.json({ error: "You can review a session once it's completed." }, { status: 409 });
  }

  const { data, error } = await supabase
    .from("reviews")
    .insert({
      booking_id: bookingId,
      client_id: auth.user.id,
      stylist_id: booking.stylist_id,
      rating,
      comment: comment ? sanitizeText(comment, 2000) : null,
      status: "published",
    })
    .select()
    .single();

  if (error) {
    if ((error as { code?: string }).code === "23505") {
      return NextResponse.json({ error: "You've already reviewed this session." }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Refresh the stylist account's aggregate rating, if it's a platform stylist.
  const admin = supabaseAdmin();
  const { data: agg } = await admin
    .from("reviews")
    .select("rating")
    .eq("stylist_id", booking.stylist_id)
    .eq("status", "published");
  if (agg && agg.length > 0) {
    const avg = agg.reduce((s, r) => s + Number(r.rating), 0) / agg.length;
    await admin
      .from("stylists")
      .update({ rating: Math.round(avg * 100) / 100, review_count: agg.length })
      .eq("slug", booking.stylist_id);
  }

  return NextResponse.json({ review: data }, { status: 201 });
}

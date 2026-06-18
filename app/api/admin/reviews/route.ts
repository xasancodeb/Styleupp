import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import { parseBody, z } from "@/lib/validation";

export const dynamic = "force-dynamic";

// GET /api/admin/reviews — list reviews for moderation.
export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const { data, error } = await supabaseAdmin()
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ reviews: data ?? [] });
}

const patchSchema = z.object({
  reviewId: z.string().uuid(),
  status: z.enum(["published", "hidden", "pending"]),
});

// PATCH /api/admin/reviews — moderate a review.
export async function PATCH(request: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const parsed = await parseBody(request, patchSchema);
  if (!parsed.ok) return parsed.response;

  const { data, error } = await supabaseAdmin()
    .from("reviews")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.reviewId)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ review: data });
}

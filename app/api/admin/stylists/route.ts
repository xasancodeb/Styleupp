import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import { parseBody, z } from "@/lib/validation";

export const dynamic = "force-dynamic";

// GET /api/admin/stylists — list stylist accounts.
export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const { data, error } = await supabaseAdmin()
    .from("stylists")
    .select("id, slug, display_name, city, country, status, rating, sessions_completed, payouts_enabled, commission_rate")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ stylists: data ?? [] });
}

const patchSchema = z.object({
  stylistId: z.string().uuid(),
  status: z.enum(["active", "paused", "suspended"]).optional(),
  featured: z.boolean().optional(),
  commissionRate: z.number().min(0).max(0.5).optional(),
});

// PATCH /api/admin/stylists — update status / featured / commission.
export async function PATCH(request: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const parsed = await parseBody(request, patchSchema);
  if (!parsed.ok) return parsed.response;
  const { stylistId, status, featured, commissionRate } = parsed.data;

  const patch: Record<string, unknown> = {};
  if (status !== undefined) patch.status = status;
  if (featured !== undefined) patch.featured = featured;
  if (commissionRate !== undefined) patch.commission_rate = commissionRate;

  const { data, error } = await supabaseAdmin()
    .from("stylists")
    .update(patch)
    .eq("id", stylistId)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ stylist: data });
}

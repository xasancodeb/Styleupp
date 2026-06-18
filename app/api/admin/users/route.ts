import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import { parseBody, z } from "@/lib/validation";

export const dynamic = "force-dynamic";

// GET /api/admin/users — list profiles.
export async function GET(request: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const q = new URL(request.url).searchParams.get("q");
  let query = supabaseAdmin()
    .from("profiles")
    .select("id, email, full_name, role, loyalty_points, created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  if (q) query = query.ilike("email", `%${q}%`);
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ users: data ?? [] });
}

const patchSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(["client", "stylist", "admin"]),
});

// PATCH /api/admin/users — change a user's role.
export async function PATCH(request: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const parsed = await parseBody(request, patchSchema);
  if (!parsed.ok) return parsed.response;

  const { data, error } = await supabaseAdmin()
    .from("profiles")
    .update({ role: parsed.data.role })
    .eq("id", parsed.data.userId)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ user: data });
}

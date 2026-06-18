import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// GET /api/notifications — recent notifications for the user.
export async function GET() {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;
  const supabase = await supabaseServer();
  const { data } = await supabase
    .from("notifications")
    .select("*")
    .eq("profile_id", auth.user.id)
    .order("created_at", { ascending: false })
    .limit(50);
  const unread = (data ?? []).filter((n) => !n.read_at).length;
  return NextResponse.json({ notifications: data ?? [], unread });
}

// PATCH /api/notifications — mark all as read.
export async function PATCH() {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;
  const supabase = await supabaseServer();
  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("profile_id", auth.user.id)
    .is("read_at", null);
  return NextResponse.json({ ok: true });
}

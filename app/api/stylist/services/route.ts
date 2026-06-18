import { NextResponse } from "next/server";
import { requireStylist } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";
import { parseBody, serviceSchema } from "@/lib/validation";
import { sanitizeText } from "@/lib/sanitize";

export const dynamic = "force-dynamic";

async function stylistId(userId: string): Promise<string | null> {
  const supabase = await supabaseServer();
  const { data } = await supabase.from("stylists").select("id").eq("profile_id", userId).maybeSingle();
  return (data?.id as string) ?? null;
}

// GET /api/stylist/services — the stylist's services.
export async function GET() {
  const auth = await requireStylist();
  if (!auth.ok) return auth.response;
  const id = await stylistId(auth.user.id);
  if (!id) return NextResponse.json({ services: [] });
  const supabase = await supabaseServer();
  const { data } = await supabase
    .from("stylist_services")
    .select("*")
    .eq("stylist_id", id)
    .order("created_at", { ascending: true });
  return NextResponse.json({ services: data ?? [] });
}

// POST /api/stylist/services — add a service.
export async function POST(request: Request) {
  const auth = await requireStylist();
  if (!auth.ok) return auth.response;
  const id = await stylistId(auth.user.id);
  if (!id) return NextResponse.json({ error: "Create your stylist profile first." }, { status: 409 });

  const parsed = await parseBody(request, serviceSchema);
  if (!parsed.ok) return parsed.response;
  const d = parsed.data;

  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("stylist_services")
    .insert({
      stylist_id: id,
      name: sanitizeText(d.name, 120),
      description: d.description ? sanitizeText(d.description, 1000) : null,
      duration_minutes: d.durationMinutes,
      price: d.price,
      session_type: d.sessionType,
    })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ service: data }, { status: 201 });
}

// DELETE /api/stylist/services?id=... — remove a service.
export async function DELETE(request: Request) {
  const auth = await requireStylist();
  if (!auth.ok) return auth.response;
  const id = await stylistId(auth.user.id);
  if (!id) return NextResponse.json({ error: "No stylist profile." }, { status: 409 });

  const serviceId = new URL(request.url).searchParams.get("id");
  if (!serviceId) return NextResponse.json({ error: "id is required." }, { status: 400 });

  const supabase = await supabaseServer();
  await supabase.from("stylist_services").delete().eq("id", serviceId).eq("stylist_id", id);
  return NextResponse.json({ ok: true });
}

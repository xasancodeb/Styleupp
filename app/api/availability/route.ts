import { NextResponse } from "next/server";
import { requireStylist } from "@/lib/auth";
import { supabaseServer, supabaseAdmin } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase";
import { parseBody, availabilitySchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

const DEFAULT_HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17];

function defaultSlots(weekday: number): string[] {
  if (weekday === 0) return [];
  return (weekday === 6 ? DEFAULT_HOURS.filter((h) => h <= 13) : DEFAULT_HOURS).map(
    (h) => `${String(h).padStart(2, "0")}:00`
  );
}

function timesBetween(start: string, end: string, slotMinutes: number): string[] {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const out: string[] = [];
  for (let mins = sh * 60 + sm; mins + slotMinutes <= eh * 60 + em; mins += slotMinutes) {
    out.push(`${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`);
  }
  return out;
}

// GET /api/availability?slug=...&date=YYYY-MM-DD — bookable slots for a day.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const slug = url.searchParams.get("slug");
  const date = url.searchParams.get("date");
  if (!slug || !date) {
    return NextResponse.json({ error: "slug and date are required." }, { status: 400 });
  }

  const day = new Date(`${date}T00:00:00`);
  const weekday = day.getDay();

  // Without a database we can't know custom rules or existing bookings, so
  // return sensible default hours immediately (never hang on a missing DB).
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ open: weekday !== 0, slots: defaultSlots(weekday) });
  }

  const admin = supabaseAdmin();

  const dayStart = new Date(`${date}T00:00:00`).toISOString();
  const dayEnd = new Date(`${date}T23:59:59`).toISOString();

  // Fetch the stylist account and the day's bookings in parallel.
  const [{ data: stylist }, { data: booked }] = await Promise.all([
    admin.from("stylists").select("id").eq("slug", slug).maybeSingle(),
    admin
      .from("bookings")
      .select("scheduled_for")
      .eq("stylist_id", slug)
      .gte("scheduled_for", dayStart)
      .lte("scheduled_for", dayEnd)
      .in("status", ["pending", "confirmed", "completed"]),
  ]);

  let slots: string[] = [];
  let isOpen = weekday !== 0; // closed Sundays by default

  if (stylist?.id) {
    const { data: rules } = await admin
      .from("stylist_availability")
      .select("*")
      .eq("stylist_id", stylist.id);

    const dayRules = (rules ?? []).filter(
      (r) => r.specific_date === date || (r.specific_date === null && r.weekday === weekday)
    );
    if (dayRules.length > 0) {
      isOpen = dayRules.some((r) => r.is_available);
      slots = dayRules
        .filter((r) => r.is_available)
        .flatMap((r) => timesBetween(r.start_time.slice(0, 5), r.end_time.slice(0, 5), r.slot_minutes))
        .sort();
      slots = Array.from(new Set(slots));
    } else if (isOpen) {
      slots = DEFAULT_HOURS.map((h) => `${String(h).padStart(2, "0")}:00`);
    }
  } else if (isOpen) {
    slots = (weekday === 6 ? DEFAULT_HOURS.filter((h) => h <= 13) : DEFAULT_HOURS).map(
      (h) => `${String(h).padStart(2, "0")}:00`
    );
  }

  // Remove already-booked slots (active statuses hold the slot).
  const taken = new Set(
    (booked ?? []).map((b) =>
      new Date(b.scheduled_for).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false })
    )
  );
  slots = slots.filter((s) => !taken.has(s));

  return NextResponse.json({ open: isOpen, slots });
}

// POST /api/availability — replace the stylist's recurring/one-off rules.
export async function POST(request: Request) {
  const auth = await requireStylist();
  if (!auth.ok) return auth.response;

  const parsed = await parseBody(request, availabilitySchema);
  if (!parsed.ok) return parsed.response;

  const supabase = await supabaseServer();
  const { data: stylist } = await supabase
    .from("stylists")
    .select("id")
    .eq("profile_id", auth.user.id)
    .maybeSingle();
  if (!stylist?.id) {
    return NextResponse.json({ error: "Complete your stylist profile first." }, { status: 409 });
  }

  // Replace existing rules atomically-ish (delete then insert).
  await supabase.from("stylist_availability").delete().eq("stylist_id", stylist.id);
  if (parsed.data.rules.length > 0) {
    const rows = parsed.data.rules.map((r) => ({
      stylist_id: stylist.id,
      weekday: r.weekday ?? null,
      specific_date: r.specificDate ?? null,
      start_time: r.startTime,
      end_time: r.endTime,
      slot_minutes: r.slotMinutes,
      is_available: r.isAvailable,
    }));
    const { error } = await supabase.from("stylist_availability").insert(rows);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

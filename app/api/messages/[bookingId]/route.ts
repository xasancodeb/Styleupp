import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";
import { redactContactInfo } from "@/lib/sanitize";

export const dynamic = "force-dynamic";

// GET /api/messages/:bookingId — the thread for a booking. Contact details are
// redacted server-side until 24 hours before the scheduled session.
export async function GET(_req: Request, { params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = await params;
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  const supabase = await supabaseServer();

  // RLS ensures only participants can read this booking + its messages.
  const { data: booking } = await supabase
    .from("bookings")
    .select("scheduled_for")
    .eq("id", bookingId)
    .maybeSingle();
  if (!booking) return NextResponse.json({ error: "Conversation not found." }, { status: 404 });

  const unlockAt = new Date(new Date(booking.scheduled_for).getTime() - 24 * 36e5);
  const unlocked = Date.now() >= unlockAt.getTime();

  const { data: messages, error } = await supabase
    .from("messages")
    .select("*")
    .eq("booking_id", bookingId)
    .order("created_at", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Mark received messages as read.
  await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("booking_id", bookingId)
    .eq("recipient_id", auth.user.id)
    .is("read_at", null);

  const safe = (messages ?? []).map((m) => ({
    ...m,
    body: unlocked || m.visibility !== "contact" ? m.body : redactContactInfo(m.body as string),
  }));

  return NextResponse.json({
    messages: safe,
    contactUnlocked: unlocked,
    unlockAt: unlockAt.toISOString(),
  });
}

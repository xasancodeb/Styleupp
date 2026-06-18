import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { supabaseServer, supabaseAdmin } from "@/lib/supabase/server";
import { parseBody, messageSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";
import { sanitizeText, containsContactInfo } from "@/lib/sanitize";
import { notify } from "@/lib/notifications";

export const dynamic = "force-dynamic";

// Resolves the other participant's profile id for a booking, or null if the
// stylist has no platform account to message.
async function counterpartyFor(
  bookingId: string,
  userId: string
): Promise<{ recipientId: string | null; ok: boolean }> {
  const admin = supabaseAdmin();
  const { data: booking } = await admin
    .from("bookings")
    .select("client_id, stylist_account_id")
    .eq("id", bookingId)
    .maybeSingle();
  if (!booking) return { recipientId: null, ok: false };

  let stylistProfileId: string | null = null;
  if (booking.stylist_account_id) {
    const { data: stylist } = await admin
      .from("stylists")
      .select("profile_id")
      .eq("id", booking.stylist_account_id)
      .maybeSingle();
    stylistProfileId = (stylist?.profile_id as string) ?? null;
  }

  if (userId === booking.client_id) return { recipientId: stylistProfileId, ok: true };
  if (userId === stylistProfileId) return { recipientId: booking.client_id as string, ok: true };
  return { recipientId: null, ok: false }; // not a participant
}

// POST /api/messages — send a message on a booking thread.
export async function POST(request: Request) {
  const limited = rateLimit(request, "messages:send", 30);
  if (limited) return limited;

  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  const parsed = await parseBody(request, messageSchema);
  if (!parsed.ok) return parsed.response;
  const { bookingId, body } = parsed.data;

  const { recipientId, ok } = await counterpartyFor(bookingId, auth.user.id);
  if (!ok) return NextResponse.json({ error: "You're not part of this conversation." }, { status: 403 });
  if (!recipientId) {
    return NextResponse.json(
      { error: "Messaging opens once your stylist joins the platform." },
      { status: 409 }
    );
  }

  const clean = sanitizeText(body, 4000);
  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("messages")
    .insert({
      booking_id: bookingId,
      sender_id: auth.user.id,
      recipient_id: recipientId,
      body: clean,
      visibility: containsContactInfo(clean) ? "contact" : "standard",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await notify(supabaseAdmin(), {
    profileId: recipientId,
    type: "new_message",
    title: "New message",
    body: "You have a new message about your booking.",
    data: { bookingId },
  });

  return NextResponse.json({ message: data }, { status: 201 });
}

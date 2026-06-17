import { NextResponse } from "next/server";
import { bearerToken, userScopedClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// >48h full refund, 24-48h 50%, <24h none.
function refundRate(scheduledFor: string): number {
  const hours = (new Date(scheduledFor).getTime() - Date.now()) / 36e5;
  if (hours >= 48) return 1;
  if (hours >= 24) return 0.5;
  return 0;
}

// GET /api/bookings/:id — fetch a single booking owned by the user.
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = bearerToken(request);
  if (!token) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  try {
    const supabase = userScopedClient(token);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", id)
      .eq("client_id", user.id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    return NextResponse.json({ booking: data });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unexpected error" },
      { status: 500 }
    );
  }
}

// PATCH /api/bookings/:id — cancel a booking and compute the refund.
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = bearerToken(request);
  if (!token) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  let body: { action?: string };
  try {
    body = await request.json();
  } catch {
    body = {};
  }
  if (body.action && body.action !== "cancel") {
    return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
  }

  try {
    const supabase = userScopedClient(token);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

    const { data: existing, error: fetchError } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", id)
      .eq("client_id", user.id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    if (existing.status === "cancelled" || existing.status === "refunded") {
      return NextResponse.json({ error: "Booking is already cancelled" }, { status: 409 });
    }

    const rate = refundRate(existing.scheduled_for);
    const refundAmount = Math.round(existing.total * rate * 100) / 100;

    const { data, error } = await supabase
      .from("bookings")
      .update({ status: rate > 0 ? "refunded" : "cancelled" })
      .eq("id", id)
      .eq("client_id", user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      booking: data,
      refund: { rate, amount: refundAmount },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unexpected error" },
      { status: 500 }
    );
  }
}

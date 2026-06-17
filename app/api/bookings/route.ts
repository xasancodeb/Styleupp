import { NextResponse } from "next/server";
import { bearerToken, userScopedClient } from "@/lib/supabase";
import { getStylist, getService } from "@/lib/data";
import { priceBreakdown } from "@/lib/stripe";

export const dynamic = "force-dynamic";

// GET /api/bookings — list the authenticated user's bookings.
export async function GET(request: Request) {
  const token = bearerToken(request);
  if (!token) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  try {
    const supabase = userScopedClient(token);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("client_id", user.id)
      .order("scheduled_for", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ bookings: data ?? [] });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unexpected error" },
      { status: 500 }
    );
  }
}

// POST /api/bookings — create a pending booking for the authenticated user.
export async function POST(request: Request) {
  const token = bearerToken(request);
  if (!token) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  let body: { stylistId?: string; serviceId?: string; scheduledFor?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { stylistId, serviceId, scheduledFor } = body;
  if (!stylistId || !serviceId || !scheduledFor) {
    return NextResponse.json(
      { error: "stylistId, serviceId and scheduledFor are required" },
      { status: 400 }
    );
  }

  const stylist = getStylist(stylistId);
  const service = getService(stylistId, serviceId);
  if (!stylist || !service) {
    return NextResponse.json({ error: "Unknown stylist or service" }, { status: 404 });
  }

  const { base, fee, total } = priceBreakdown(service.price);

  try {
    const supabase = userScopedClient(token);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("bookings")
      .insert({
        client_id: user.id,
        stylist_id: stylistId,
        service_id: serviceId,
        service_name: service.name,
        session_type: service.sessionType,
        scheduled_for: scheduledFor,
        amount: base,
        platform_fee: fee,
        total,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ booking: data }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unexpected error" },
      { status: 500 }
    );
  }
}

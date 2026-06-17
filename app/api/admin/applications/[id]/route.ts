import { NextResponse } from "next/server";
import { bearerToken, userScopedClient, serverClient } from "@/lib/supabase";
import type { ApplicationStatus } from "@/lib/database.types";

export const dynamic = "force-dynamic";

async function requireAdmin(request: Request): Promise<string | null> {
  const token = bearerToken(request);
  if (!token) return null;
  const supabase = userScopedClient(token);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  return profile?.role === "admin" ? user.id : null;
}

// PATCH /api/admin/applications/:id — approve or reject a stylist application.
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let body: { status?: ApplicationStatus };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const status = body.status;
  if (status !== "approved" && status !== "rejected") {
    return NextResponse.json({ error: "status must be 'approved' or 'rejected'" }, { status: 400 });
  }

  try {
    const adminId = await requireAdmin(request);
    if (!adminId) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const admin = serverClient();
    const { data, error } = await admin
      .from("stylist_applications")
      .update({ status, reviewed_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json({ error: error?.message ?? "Application not found" }, { status: 404 });
    }

    // On approval, create the stylist profile + record skeleton.
    if (status === "approved") {
      const { data: existing } = await admin
        .from("stylists")
        .select("id")
        .eq("profile_id", data.id)
        .maybeSingle();

      if (!existing) {
        await admin.from("stylists").insert({
          profile_id: data.id,
          display_name: data.full_name,
          city: data.city,
          country: data.country,
          specialties: data.specialties ?? [],
          session_types: ["virtual"],
          starting_price: 90,
          rating: 0,
          sessions_completed: 0,
          commission_tier: "Starter",
          status: "active",
        });
      }
    }

    return NextResponse.json({ application: data });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unexpected error" },
      { status: 500 }
    );
  }
}

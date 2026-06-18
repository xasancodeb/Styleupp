import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import { parseBody, applicationReviewSchema } from "@/lib/validation";
import { sendEmail, stylistApprovedEmail } from "@/lib/email";
import { notify } from "@/lib/notifications";

export const dynamic = "force-dynamic";

function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .slice(0, 60) || `stylist-${Math.random().toString(36).slice(2, 8)}`
  );
}

// PATCH /api/admin/applications/:id — approve or reject a stylist application.
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const parsed = await parseBody(request, applicationReviewSchema);
  if (!parsed.ok) return parsed.response;
  const { status } = parsed.data;

  const admin = supabaseAdmin();
  const { data: application, error } = await admin
    .from("stylist_applications")
    .update({ status, reviewed_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error || !application) {
    return NextResponse.json({ error: error?.message ?? "Application not found." }, { status: 404 });
  }

  if (status === "approved") {
    // Link to an existing account if the applicant already signed up.
    const { data: profile } = await admin
      .from("profiles")
      .select("id")
      .eq("email", application.email)
      .maybeSingle();

    if (profile?.id) {
      await admin.from("profiles").update({ role: "stylist" }).eq("id", profile.id);

      const { data: existing } = await admin
        .from("stylists")
        .select("id")
        .eq("profile_id", profile.id)
        .maybeSingle();

      if (!existing) {
        let slug = slugify(application.full_name);
        const { data: clash } = await admin.from("stylists").select("id").eq("slug", slug).maybeSingle();
        if (clash) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
        await admin.from("stylists").insert({
          profile_id: profile.id,
          slug,
          display_name: application.full_name,
          city: application.city,
          country: application.country,
          years_experience: application.years_experience ?? 0,
          specialties: application.specialties ?? [],
          session_types: ["virtual"],
          starting_price: 90,
          commission_rate: 0.2,
          status: "active",
        });
      }

      await notify(admin, {
        profileId: profile.id,
        type: "application_approved",
        title: "You're approved 🎉",
        body: "Your stylist application has been approved. Complete onboarding to start taking bookings.",
        email: { to: application.email, ...stylistApprovedEmail({ name: application.full_name }) },
      });
    } else {
      // No account yet — just email them to sign up.
      const email = stylistApprovedEmail({ name: application.full_name });
      await sendEmail({ to: application.email, ...email });
    }
  }

  return NextResponse.json({ application });
}
